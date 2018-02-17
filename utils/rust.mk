default: build

downloads/linux_channel.toml:
	mkdir -p downloads
	curl https://static.rust-lang.org/dist/channel-rust-nightly.toml -o downloads/linux_channel.toml

GET_RUSTC_URL=${shell node utils/toml_value.js downloads/linux_channel.toml pkg.rustc.target.x86_64-unknown-linux-gnu url}

downloads/linux_rustc.tar.gz: downloads/linux_channel.toml
	curl ${GET_RUSTC_URL} -o downloads/linux_rustc.tar.gz

GET_CARGO_URL=${shell node utils/toml_value.js downloads/linux_channel.toml pkg.cargo.target.x86_64-unknown-linux-gnu url}

downloads/linux_cargo.tar.gz: downloads/linux_channel.toml
	curl ${GET_CARGO_URL} -o downloads/linux_cargo.tar.gz

GET_RUST_STD_URL=${shell node utils/toml_value.js downloads/linux_channel.toml pkg.rust-std.target.wasm32-unknown-unknown url}

downloads/wasm_rust_std.tar.gz: downloads/linux_channel.toml
	curl ${GET_RUST_STD_URL} -o downloads/wasm_rust_std.tar.gz


app/rust: downloads/linux_cargo.tar.gz downloads/linux_rustc.tar.gz downloads/wasm_rust_std.tar.gz
	mkdir -p app/rust
	tar -C app/rust/ --strip-components=2 -xvf downloads/linux_cargo.tar.gz "*/cargo"
	tar -C app/rust/ --strip-components=2 -xvf downloads/linux_rustc.tar.gz "*/rustc"
	tar -C app/rust/ --strip-components=2 -xvf downloads/wasm_rust_std.tar.gz "*/rust-std-wasm32-*"
	rm -rf app/rust/manifest.in app/rust/share

app/misc: precomp/wasm-gc
	mkdir -p app/misc
	cp precomp/wasm-gc app/misc

build: app/rust app/misc

.PHONY: default build
