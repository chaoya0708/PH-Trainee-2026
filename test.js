const fs = require('fs');
const code = fs.readFileSync('google-apps-script/Code.gs', 'utf8');
try {
  new Function(code);
  console.log("No syntax errors");
} catch (e) {
  console.log("Syntax error:", e);
}
