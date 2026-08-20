const fs = require('fs');
const content = fs.readFileSync('js/api.js', 'utf8');
if (content.includes("fetch(gasUrl")) {
  console.log("api.js contains the fetch fix.");
} else {
  console.log("api.js does NOT contain the fetch fix!");
}
