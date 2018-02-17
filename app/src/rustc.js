const fs = require('fs');
const { exec } = require('child_process');

const { rustcCmd, wasmGCCmd, tempDir } = require("../config.js");

function joinCmd(arr) {
  return arr.join(' ');
}

function wasmGC(wasmFile, callback) {
  fs.exists(wasmFile, (exists) => {
    if (!exists) {
      return callback(new Error("wasm is not found"), '');
    }
    exec(
      joinCmd([wasmGCCmd, wasmFile]),
      (err, stdout, stderr) => {
        callback(err, stdout + stderr);
      }
    );
  });
}

module.exports = function rustc(source, options, callback) {
  var baseName = tempDir + '/rustc_h_' + Math.random().toString(36).slice(2);
  var rustFile = baseName + '.rs';
  var wasmFile = baseName + '.wasm';
  fs.writeFile(rustFile, source, (err) => {
    if (err) return callback(err);

    exec(
      joinCmd([rustcCmd, rustFile, '--target=wasm32-unknown-unknown --crate-type=cdylib', '-O', '-o', wasmFile]),
      (err, stdout, stderr) => {
        var console = stdout.toString() + stderr.toString();
        wasmGC(wasmFile, (err) => {
          fs.readFile(wasmFile, (err, content) => {
            var success = !err;
            var wasm = err ? undefined : content.toString('base64');
            if (!err) fs.unlink(wasmFile, () => {});
            fs.unlink(rustFile, () => {});
            callback(null, { success, output: wasm, console, });
          });
        });
      }
    );
  });
};
