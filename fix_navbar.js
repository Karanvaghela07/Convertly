const fs = require('fs');
const glob = require('fs').readdirSync;
const htmlFiles = glob('public').filter(f => f.endsWith('.html')).map(f => 'public/' + f);

const correct_nav_links = `      <div class="nav-links">
        <div class="dropdown">
          <a href="#" class="nav-link">Convert PDF ▾</a>
          <div class="dropdown-menu">
            <a href="/pdf-to-word.html">PDF to Word</a>
            <a href="/word-to-pdf.html">Word to PDF</a>
            <a href="/pdf-to-jpg.html">PDF to JPG</a>
            <a href="/jpg-to-pdf.html">JPG to PDF</a>
            <a href="/pdf-to-excel.html">PDF to Excel</a>
            <a href="/excel-to-pdf.html">Excel to PDF</a>
          </div>
        </div>
        <div class="dropdown">
          <a href="#" class="nav-link">Excel Tools ▾</a>
          <div class="dropdown-menu">
            <a href="/excel-to-pdf.html">Excel to PDF</a>
            <a href="/pdf-to-excel.html">PDF to Excel</a>
            <a href="/csv-to-excel.html">CSV to Excel</a>
            <a href="/excel-to-csv.html">Excel to CSV</a>
            <a href="/json-to-csv.html">JSON to CSV <span style="font-size:0.6rem; background:#E5322D; color:#fff; padding:2px 6px; border-radius:10px; margin-left:4px;">NEW</span></a>
          </div>
        </div>
        <div class="dropdown">
          <a href="#" class="nav-link">Organize PDF ▾</a>
          <div class="dropdown-menu">
            <a href="/merge-pdf.html">Merge PDF</a>
            <a href="/split-pdf.html">Split PDF</a>
            <a href="/compress-pdf.html">Compress PDF</a>
            <a href="/protect-pdf.html">Protect PDF <span style="font-size:0.6rem; background:#E5322D; color:#fff; padding:2px 6px; border-radius:10px; margin-left:4px;">NEW</span></a>
          </div>
        </div>
        <div class="dropdown">
          <a href="#" class="nav-link">Resources ▾</a>
          <div class="dropdown-menu">
            <a href="/guides.html">How-To Guides</a>
            <a href="/articles.html">Articles & Blog</a>
            <a href="/faq.html">FAQ</a>
            <a href="/about.html">About Us</a>
            <a href="/contact.html">Contact</a>
          </div>
        </div>
      </div>`;

for (let f of htmlFiles) {
    let content = fs.readFileSync(f, 'utf8');
    
    // The regex matches <div class="nav-links"> followed by anything up to <div class="nav-actions">
    const regex = /<div class="nav-links">[\s\S]*?(?=<div class="nav-actions">)/;
    
    if (regex.test(content)) {
        let new_content = content.replace(regex, correct_nav_links + '\n      ');
        fs.writeFileSync(f, new_content, 'utf8');
        console.log('Fixed ' + f);
    } else {
        console.log('Skipped ' + f);
    }
}
