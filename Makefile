
test:
	@./node_modules/.bin/mocha \
		--harmony-generators \
		--reporter spec \
		--require co-mocha

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
