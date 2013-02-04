
build: components
	@component build --dev
	coffee -j holla.js -c lib/holla

	# Prepend deps
	cat node_modules/engine.io-client/dist/engine.io.js | cat - holla.js > /tmp/out && mv /tmp/out holla.js

	# Minify
	uglifyjs -nc --unsafe -mt -o holla.min.js holla.js
	echo "File size (minified): " && cat holla.min.js | wc -c
	echo "File size (gzipped): " && cat holla.min.js | gzip -9f  | wc -c

	cp holla.js examples/holla.js
	cp effects.css examples/effects.css

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

.PHONY: clean