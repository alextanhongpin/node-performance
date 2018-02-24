## Tips

1. Set `NODE_ENV = production` 
2. use the `cluster` module

ab -n 1000 -c 1 http://localhost:3000/

siege -c 100 -t 30s http://localhost:3000/

wrk -t4 -c100 -d30s --latency http://localhost:3000/