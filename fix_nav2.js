const fs = require('fs');
const path = require('path');
const publicDir = path.join(__dirname, 'public');

const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

files.forEach(f => {
    const filePath = path.join(publicDir, f);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove AI Summarizer PRO links
    content = content.replace(/<a href="\.\/ai-pdf-summarizer.html".*?<\/a>\s*/g, '');
    
    // We want to add something new. Let's add 'Add Watermark' instead
    // But since the user wants to remove the repeat, let's just make sure there are no new repeated items.
    
    fs.writeFileSync(filePath, content);
});
console.log('Done fixing navbar');