
test:
	@./node_modules/.bin/mocha \
		--harmony-generators \
		--reporter spec \
		--require co-mocha

example:
	@duo \
		--root example \
		example/app/{admin,home}/*.js
	@node example/

.PHONY: example test
