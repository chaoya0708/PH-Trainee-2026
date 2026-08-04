const fs = require('fs');
const esprima = require('esprima');
const code = fs.readFileSync('js/api.js', 'utf8');
try {
  esprima.parseScript(code);
  console.log("api.js No syntax errors");
} catch(e) {
  console.log("api.js Syntax error:", e);
}
