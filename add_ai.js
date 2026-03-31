const fs = require('fs');
const path = require('path');
const publicDir = path.join(__dirname, 'public');

const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

for (const file of files) {
  const filePath = path.join(publicDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Under Organize PDF dropdown:
  const targetStr = '<a href="/protect-pdf.html">Protect PDF <span style="font-size:0.6rem; background:#E5322D; color:#fff; padding:2px 6px; border-radius:10px; margin-left:4px;">NEW</span></a>';
  const newLink = `\n            <a href="/ai-pdf-summarizer.html">AI Summarizer <span style="font-size:0.6rem; background:linear-gradient(90deg, #8b5cf6, #3b82f6); color:#fff; padding:2px 6px; border-radius:10px; margin-left:4px;">PRO</span></a>`;
  
  const finalContent = content.replace(targetStr, targetStr + newLink);
  fs.writeFileSync(filePath, finalContent);
}
console.log('Done!');
