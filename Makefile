
test:
	@./node_modules/.bin/mocha \
		--require should \
		--reporter spec

example:
	@./node_modules/.bin/duo \
		--root example/ \
		app/home/index.js \
		1> /dev/null

	@./node_modules/.bin/duo \
		--root example/ \
		app/admin/index.js \
		1> /dev/null

.PHONY: example test
