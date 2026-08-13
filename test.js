const fs = require('fs');
try {
  const content = fs.readFileSync('js/app.js', 'utf8');
  new Function(content);
  console.log("Syntax OK");
} catch(e) {
  console.log(e.toString());
  const lines = fs.readFileSync('js/app.js', 'utf8').split('\n');
  for (let i = 0; i < lines.length; i++) {
    try {
      new Function(lines.slice(0, i+1).join('\n'));
    } catch(err) {
      if (!err.toString().includes('Unexpected end of input')) {
        console.log("Error likely around line " + (i+1));
        break;
      }
    }
  }
}
