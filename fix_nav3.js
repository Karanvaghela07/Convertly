const fs = require('fs');
const path = require('path');
const publicDir = path.join(__dirname, 'public');

const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

files.forEach(f => {
    const filePath = path.join(publicDir, f);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove AI Summarizer PRO links
    content = content.replace(/<a href="[\.\/]*ai-pdf-summarizer.*?<\/a>\s*/g, '');
    
    fs.writeFileSync(filePath, content);
});
console.log('Done fixing navbar again');