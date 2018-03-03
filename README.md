## Tips

1. Set `NODE_ENV = production` 
2. use the `cluster` module

ab -n 1000 -c 1 http://localhost:3000/

siege -c 100 -t 30s http://localhost:3000/

wrk -t4 -c100 -d30s --latency http://localhost:3000/


## With ab, without cache

```
Server Software:
Server Hostname:        localhost
Server Port:            3000

Document Path:          /
Document Length:        21 bytes

Concurrency Level:      1
Time taken for tests:   4.110 seconds
Complete requests:      1000
Failed requests:        0
Total transferred:      228000 bytes
HTML transferred:       21000 bytes
Requests per second:    243.30 [#/sec] (mean)
Time per request:       4.110 [ms] (mean)
Time per request:       4.110 [ms] (mean, across all concurrent requests)
Transfer rate:          54.17 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.2      0       4
Processing:     1    4  42.2      1     681
Waiting:        0    4  42.2      1     681
Total:          1    4  42.2      1     681

Percentage of the requests served within a certain time (ms)
  50%      1
  66%      1
  75%      1
  80%      1
  90%      2
  95%      3
  98%      5
  99%     13
 100%    681 (longest request)
 ```

## With nginx cache

```
Server Software:        nginx/1.13.9
Server Hostname:        localhost
Server Port:            4000

Document Path:          /
Document Length:        21 bytes

Concurrency Level:      1
Time taken for tests:   1.773 seconds
Complete requests:      1000
Failed requests:        0
Total transferred:      271000 bytes
HTML transferred:       21000 bytes
Requests per second:    564.17 [#/sec] (mean)
Time per request:       1.773 [ms] (mean)
Time per request:       1.773 [ms] (mean, across all concurrent requests)
Transfer rate:          149.31 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.2      0       4
Processing:     1    2   0.8      1      10
Waiting:        1    2   0.8      1      10
Total:          1    2   0.9      1      11
WARNING: The median and mean for the processing time are not within a normal deviation
        These results are probably not that reliable.
WARNING: The median and mean for the waiting time are not within a normal deviation
        These results are probably not that reliable.
WARNING: The median and mean for the total time are not within a normal deviation
        These results are probably not that reliable.

Percentage of the requests served within a certain time (ms)
  50%      1
  66%      2
  75%      2
  80%      2
  90%      2
  95%      3
  98%      5
  99%      6
 100%     11 (longest request)
```

## TODO

```nginx.conf
# This number should be, at maximum, the number of CPU cores on your system. 
# (since nginx doesn't benefit from more than one worker per CPU.)
worker_processes 8;
 
 
# Determines how many clients will be served by each worker process.
# (Max clients = worker_connections * worker_processes)
# "Max clients" is also limited by the number of socket connections available on the system (~64k)
# run ss -s  and u'll see a timewait param
# The reason for TIMED_WAIT is to handle the case of packets arriving after the socket is closed. 
# This can happen because packets are delayed or the other side just doesn't know that the socket has been closed.
#
# From the point of view of the client (nginx)
#   sysctl net.ipv4.ip_local_port_range
# 	sysctl net.ipv4.tcp_fin_timeout
# 	Result:
#		net.ipv4.ip_local_port_range = 32768 61000
#		net.ipv4.tcp_fin_timeout = 60  (in other words it causes the TIMED_WAIT)
# 	(61000 - 32768) / 60 = 470 sockets at any given time
# 	You can tune these values in order to get more sockets available at a time
#
# 	Another option would be:
#		net.ipv4.tcp_tw_recycle = 1
#		net.ipv4.tcp_tw_reuse = 1 
# 	In order to allow used sockets in WAIT state, to be reused
#
# From the point of view of the server (node process)
#		sysctl net.core.somaxconn
# 	It limits the maximum number of requests queued to a listen socket. You can increase it.
# 	The value of somaxconn is the size of the listen queue.
# 	Once the connection is established it is no longer in the listen queue and this number doesn't matter. 
# 	If the listen queue is filled up due to to many simultaneous connection requests then additional connections will be refused.
# 	Defaults to 128. The value should be raised substantially to support bursts of request. 
# 	For example, to support a burst of 1024 requests, set somaxconn to 1024.
#	net.core.netdev_max_backlog and net.ipv4.tcp_max_syn_backlog
worker_connections 4000;
 
 
# essential for linux, optmized to serve many clients with each thread (efficient method used on Linux 2.6+.)
use epoll;
 
 
# Accept as many connections as possible, after nginx gets notification about a new connection.
# May flood worker_connections, if that option is set too low.
multi_accept on;




# Open files
# How to know how much open files u consume?
#	ulimit -n   # open files limit per process
#	lsof | grep nginx | wc -l  # count how many open files an app is taking
#	cat /proc/sys/fs/file-max    # get max open files allowed

# Number of file descriptors used for Nginx. This is set in the OS with 'ulimit -n 200000'
# or using /etc/security/limits.conf
# Edit /etc/security/limits.conf in order to increase hard and soft opened files allowed
#	* hard nproc 200000
#	* soft nproc 200000
worker_rlimit_nofile 200000;


# Caches information about open FDs, freqently accessed files.
# Changing this setting, in my environment, brought performance up from 560k req/sec, to 904k req/sec.
# I recommend using some varient of these options, though not the specific values listed below.
open_file_cache max=200000 inactive=5s; 
open_file_cache_valid 15s; 
open_file_cache_min_uses 1;
open_file_cache_errors off;
 
 
# Buffer log writes to speed up IO, or disable them altogether
#access_log /var/log/nginx/access.log main buffer=16k;
access_log off;
 
 
# Sendfile copies data between one FD and other from within the kernel. 
# More efficient than read() + write(), since the requires transferring data to and from the user space.
sendfile on; 
 
 
# Tcp_nopush causes nginx to attempt to send its HTTP response head in one packet, 
# instead of using partial frames. This is useful for prepending headers before calling sendfile, 
# or for throughput optimization.
tcp_nopush on;
 
 
# don't buffer data-sends (disable Nagle algorithm). Good for sending frequent small bursts of data in real time.
tcp_nodelay on; 
 
 
# Timeout for keep-alive connections. Server will close connections after this time.
keepalive_timeout 3;
 
 
# Number of requests a client can make over the keep-alive connection. This is set high for testing.
keepalive_requests 100;
 
 
# allow the server to close the connection after a client stops responding. Frees up socket-associated memory.
reset_timedout_connection on;
 
 
# send the client a "request timed out" if the body is not loaded by this time. Default 60.
client_body_timeout 10;
 
 
# If the client stops reading data, free up the stale client connection after this much time. Default 60.
send_timeout 2;
```
