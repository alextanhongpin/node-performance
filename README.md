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