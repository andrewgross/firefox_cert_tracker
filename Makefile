all: clean zip

clean:
	rm -rf build/*
	mkdir -p build/

zip: 
	zip -r build/certificate_chain_viewer.xpi ./certificate_chain_viewer