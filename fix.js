const fs = require('fs');
const glob = require('glob'); // wait, glob is not default. Better use fs.readdirSync
const path = require('path');

const dir = 'public';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(f => {
    const filePath = path.join(dir, f);
    let c = fs.readFileSync(filePath, 'utf8');
    
    // literal \n replace
    c = c.replace(/\\n/g, '\n');
    
    // Deduplicate JSON to CSV
    c = c.replace(/(<a href="\/excel-to-csv\.html">Excel to CSV<\/a>)(?:\s*<a href="\/json-to-csv\.html">JSON to CSV(?:.|\s)*?<\/a>)+/g, '\\n            <a href="/json-to-csv.html">JSON to CSV <span style="font-size:0.6rem; background:#E5322D; color:#fff; padding:2px 6px; border-radius:10px; margin-left:4px;">NEW</span></a>');
    
    // Deduplicate Protect PDF
    c = c.replace(/(<a href="\/compress-pdf\.html">Compress PDF<\/a>)(?:\s*<a href="\/protect-pdf\.html">Protect PDF(?:.|\s)*?<\/a>)+/g, '\\n            <a href="/protect-pdf.html">Protect PDF <span style="font-size:0.6rem; background:#E5322D; color:#fff; padding:2px 6px; border-radius:10px; margin-left:4px;">NEW</span></a>');
    
    fs.writeFileSync(filePath, c, 'utf8');
});
console.log('Fixed');