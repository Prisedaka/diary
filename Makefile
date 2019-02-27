test:
	npm test

start:
	npm run nodemon -- --exec babel-node bin/server.js

lint:
	npm run eslint .