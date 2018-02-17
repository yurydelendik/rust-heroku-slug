const onServer = !!process.env["DYNO"];
const homeDir = process.env["HOME"];

exports.rustcCmd = onServer ?
  homeDir + '/rust/bin/rustc' :
  homeDir + '/.rustup/toolchains/nightly-x86_64-apple-darwin/bin/rustc';

exports.wasmGCCmd = onServer ?
  homeDir + '/misc/wasm-gc' :
  homeDir + '/.cargo/bin/wasm-gc';

exports.tempDir = "/tmp";
