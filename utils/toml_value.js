const toml = process.argv[2];
const section = process.argv[3];
const property = process.argv[4];

const lines = require('fs').readFileSync(toml).toString().split('\n');
const sectionStart = lines.indexOf('[' + section + ']');
if (sectionStart < 0)
  process.exit(1);

for (let i = sectionStart + 1; i < lines.length; i++) {
  const line = lines[i];
  if (line[0] == '[') break;
  const parts = line.split(/\s*=\s*/, 2);
  if (parts[0] == property) {
    console.log(JSON.parse(parts[1]));
    process.exit(0);
  }
}

// not found
process.exit(1);
