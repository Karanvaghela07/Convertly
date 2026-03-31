const fs = require('fs');
const path = require('path');
const publicDir = path.join(__dirname, 'public');

const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

files.forEach(f => {
    const filePath = path.join(publicDir, f);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it already has watermark to avoid duplicates
    if (!content.includes('/add-watermark.html')) {
        // Insert into navbar drop down under Organize PDF
        const targetNav = `<a href="/protect-pdf.html">Protect PDF <span style="font-size:0.6rem; background:#E5322D; color:#fff; padding:2px 6px; border-radius:10px; margin-left:4px;">NEW</span></a>`;
        const newNavItem = `\n            <a href="/add-watermark.html">Add Watermark <span style="font-size:0.6rem; background:linear-gradient(90deg, #f59e0b, #ec4899); color:#fff; padding:2px 6px; border-radius:10px; margin-left:4px;">PRO</span></a>`;
        
        content = content.replace(targetNav, targetNav + newNavItem);
    }

    fs.writeFileSync(filePath, content);
});
console.log('Watermark nav added completely to all files.');