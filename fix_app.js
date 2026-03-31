const fs = require('fs');
let c = fs.readFileSync('public/js/app.js', 'utf8');

c = c.replace(/extraInput\.style\.display = tool\.hasPageRange \? 'block' : 'none';/g, "extraInput.style.display = (tool.hasPageRange || tool.hasExtraInput) ? 'block' : 'none';");

fs.writeFileSync('public/js/app.js', c, 'utf8');
console.log('Fixed extraInput display in app.js');