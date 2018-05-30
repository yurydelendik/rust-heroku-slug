const {
  cargoCmd,
  rustcCmd,
  wasmGCCmd,
  tempDir,
  wasmBindgenCmd,
  wasmBindgenDeps,
} = require("../config.js");
const { exec, joinCmd, exists, writeFile, readFile, mkdir, unlink } = require("./common.js");

async function wasmGC(wasmFile, callback) {
  if (!await exists(wasmFile)) {
    throw new Error("wasm is not found")
  }
  await exec(joinCmd([wasmGCCmd, wasmFile]));
}

async function cargo(tar, options = {}) {
  let crateName = 'rustc_h_' + Math.random().toString(36).slice(2);
  let crateDir = tempDir + '/' + crateName;
  console.log(crateDir);

  await mkdir(crateDir);

  let rustTar = crateDir + '/' + 'lib.tar';
  let wasmFile = crateDir + '/' + 'lib.wasm';
  await writeFile(rustTar, new Buffer(tar, 'base64').toString('ascii'));

  let args = ["tar", "xvf", rustTar, "-C", crateDir];
  await exec(joinCmd(args));

  try {
    let args = [cargoCmd, "build"];
    args.push('--manifest-path=' + crateDir + '/' + 'Cargo.toml');
    args.push('--target=wasm32-unknown-unknown');
    if (options.lto)
      args.push('-Clto');
    if (options.debug) {
      args.push('--debug');
    } else {
      args.push('--release');
    }

    let planArgs = args.slice(0);
    planArgs.push("-Z unstable-options");
    planArgs.push("--build-plan");
    planArgs.push("--quiet");

    let planOutput = await exec(joinCmd(planArgs), {});
    let plan = JSON.parse(planOutput)

    let output;
    let success = false;

    try {
      output = await exec(joinCmd(args), {});
      success = true;
    } catch(e) {
      output = 'error: ' + e;
    }
    try {
      let wasmFile = Object.keys(plan["invocations"].slice(-1)[0]["links"])[0];

      if (!success)
        return { success, output: "", message: output };
      let wasmBindgenJs = "";
      let wasm = await readFile(wasmFile);
      console.log("compiling wasm");
      let m = await WebAssembly.compile(wasm);
      let ret = { success, message: output };
      if (WebAssembly.Module.customSections(m, "__wasm_bindgen_unstable").length !== 0) {
        console.log("found custom section");
        await exec(joinCmd([wasmBindgenCmd, wasmFile, '--no-modules', '--out-dir', tempDir]));
        wasm = await readFile(wasmFile + '_bg.wasm');
        ret.wasmBindgenJs = (await readFile(baseName + '.js')).toString();
      } else {
        await exec(joinCmd([wasmGCCmd, wasmFile]));
        wasm = await readFile(wasmFile);
      }
      ret.output = wasm.toString('base64');
      return ret;
    } finally {
      if (success) {}
        //await unlink(wasmFile);
    }
  } finally {
    //await unlink(crateDir);
  }
}

module.exports = function(source, options, callback) {
  cargo(source, options)
    .then(result => callback(null, result))
    .catch(err => callback(err, null));
};
