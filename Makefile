test-get:
	ab -T application/json -c 25 -n 1000 http://localhost:3000/no-limit

test-post:
	ab -p post.txt -T application/json -c 25 -n 1000 http://localhost:3000/no-limit

test-nginx-get:
	ab -T application/json -c 25 -n 1000 http://localhost:4000/no-limit

prof:
	node --prof server.js

report:
	@find *-v8.log -exec node --prof-process "{}" > processed.txt \;

clear-log:
	rm -rf *-v8.log