const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const htmlDir = path.join(__dirname, 'public');

const seoContentMap = {
    'word-to-pdf.html': `
        <h2 class="seo-title">Convert Word to PDF: Professional Document Conversion</h2>
        <div style="margin-top: 30px; line-height: 1.8; color: var(--text-gray);">
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Understanding Word to PDF</h3>
          <p>Word to PDF conversion transforms your Microsoft Word documents (DOC, DOCX) into the universally compatible PDF format. This ensures that the document's original formatting, layout, fonts, and images remain exactly the same when opened on any device, operating system, or browser.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Why Convert to PDF?</h3>
          <p>PDFs are ideal for distribution because they prevent accidental edits and formatting and layout issues. Whether you are sending a professional resume, a business contract, or a school assignment, a PDF guarantees that the recipient sees the exact document you intended to send.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Fast and Secure Conversion</h3>
          <p>Using Convertly, you can transform your Word files in seconds without installing any additional software. Your files are processed securely in your browser and backend, and we ensure that all documents are immediately wiped from our servers after the conversion finishes.</p>
        </div>`,
    
    'pdf-to-word.html': `
        <h2 class="seo-title">Convert PDF to Word: Editable and Accurate</h2>
        <div style="margin-top: 30px; line-height: 1.8; color: var(--text-gray);">
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">What is PDF to Word Conversion?</h3>
          <p>This process extracts the text, images, and layout from a static PDF and translates it back into a fully editable Microsoft Word Document (DOCX). Instead of manually retyping long documents, you can automatically convert them and begin editing immediately.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Perfect Formatting Preservation</h3>
          <p>Our advanced translation engine analyzes the PDF layout, attempting to identify exact paragraphs, lists, tables, and image placements. It reconstructs these elements natively in Word, so you don't have to spend hours adjusting margins or font sizes to make it match the original.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Secure and Offline Tools</h3>
          <p>Upload your PDF, hit convert, and get your DOCX file in seconds. We value your privacy, which is why your uploaded files are processed using highly secure encryption and are cleared from all server memory the moment your download completes.</p>
        </div>`,
        
    'compress-pdf.html': `
        <h2 class="seo-title">Compress PDF Files: Drastically Reduce File Size</h2>
        <div style="margin-top: 30px; line-height: 1.8; color: var(--text-gray);">
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">The Need for PDF Compression</h3>
          <p>Many emails, portals, and submission forms have strict file size limits (often 25MB or less). A high-resolution PDF filled with images or scanned pages can easily exceed these limits. Compression intelligently downsizes these files without compromising their readability.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">How does Convertly Compress PDFs?</h3>
          <p>Our smart optimization engine targets the heaviest parts of a PDF: the embedded media. It optimizes DPI, removes redundant data streams, and flattens invisible layers. The result is a dramatic file size reduction (often up to 80%) while maintaining visual quality.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Secure & Immediate Download</h3>
          <p>Stop worrying about desktop software limits. Use our fast web tool, shrink your files down to web-friendly sizes instantly, and share them instantly. Standard encryption ensures that your data remains 100% private.</p>
        </div>`,
        
    'compress-image.html': `
        <h2 class="seo-title">Compress Images: Optimize Web Photos Instantly</h2>
        <div style="margin-top: 30px; line-height: 1.8; color: var(--text-gray);">
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Why Compress Images?</h3>
          <p>Large, raw image files (like those directly from a smartphone or DSLR) can take up massive storage space and drastically slow down website loading speeds. Compressing images reduces their footprint, making them perfect for web use, quick emailing, and archiving.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Lossless vs. Lossy Savings</h3>
          <p>Our compressor finds the perfect balance by optimizing image data, removing unnecessary meta layers, and minimizing color palettes where the human eye can't notice the difference. You get a lightweight file with near-original visual fidelity.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Completely Secure and Free</h3>
          <p>Save bandwidth and storage efficiently. Convertly's image compressor works extremely fast, strictly processes the files via secure protocols, and erases the image data from servers immediately after you successfully download it.</p>
        </div>`,

    'merge-pdf.html': `
        <h2 class="seo-title">Merge PDFs: Seamlessly Combine Multiple Files</h2>
        <div style="margin-top: 30px; line-height: 1.8; color: var(--text-gray);">
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Organize Your PDF workflow</h3>
          <p>Have dozens of separate invoice pages, chapters, or legal briefs? Instead of sending a cluttered zip folder, simply merge all your specific PDF documents into one single, cohesive, master file for a cleaner, professional presentation.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Perfect for Professionals</h3>
          <p>Whether compiling end-of-year tax returns, gathering contract appendices, or bundling student assignments, the merge tool appends documents sequentially while retaining their original formatting, bookmarks, and font designs.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Instant & Reliable Merging</h3>
          <p>Upload your files, order them, and our engine will quickly stitch them together into one downloadable document. No watermarks, completely free, and completely secure processing.</p>
        </div>`,

    'split-pdf.html': `
        <h2 class="seo-title">Split PDF Files: Extract Pages Instantly</h2>
        <div style="margin-top: 30px; line-height: 1.8; color: var(--text-gray);">
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Dismantle Large Documents with Ease</h3>
          <p>When you have a massive hundred-page PDF but only need to email one specific section (like a single contract page or form), splitting the PDF is the ideal solution. You can quickly extract individual, standalone documents.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">How It Works</h3>
          <p>Provide the page range or specify particular pages, and our tool cleanly cuts the original file without losing any formatting or visual quality on the extracted sections. It perfectly clones the layout into a bite-sized file.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Absolute Privacy</h3>
          <p>All splits are processed securely. Your original massive document and the newly extracted pieces are automatically cleared from the server after your session to guarantee strict data privacy.</p>
        </div>`,

    'add-watermark.html': `
        <h2 class="seo-title">Add Watermark: Brand & Protect Your PDFs</h2>
        <div style="margin-top: 30px; line-height: 1.8; color: var(--text-gray);">
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Professional PDF Branding</h3>
          <p>An easy way to secure your intellectual property or classify drafts. Our Watermark tool lets you cleanly stamp text (like 'CONFIDENTIAL', 'DRAFT', or your name) across every page of your PDF file in transparent styling.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Designed for Workflows</h3>
          <p>Unlike basic tools, our engine centers the text securely across the page diagonally using smart transparency, so the document underneath remains perfectly readable while visually marking who the document belongs to.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Server-Side Encryption</h3>
          <p>The entire watermarking logic happens intelligently in real-time. It iterates over your document quickly, modifies the layers, and safely delivers a marked PDF without risking your file exposure.</p>
        </div>`,

    'protect-pdf.html': `
        <h2 class="seo-title">Protect PDF: High-Security Document Locking</h2>
        <div style="margin-top: 30px; line-height: 1.8; color: var(--text-gray);">
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Why Lock Your PDF?</h3>
          <p>Ensure that sensitive information—like bank statements, personal health records, or classified business contracts—can only be accessed by the specific people you authorize. Putting a password on your PDF prevents unauthorized snoopers from opening the file.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Advanced AES Encryption</h3>
          <p>We do not just put a visual lock on the file. We rewrite the data stream using advanced standard user-password encryption algorithms. Unless the viewer physically has the correct password, the document's content string remains encrypted and unreadable.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Privacy Guaranteed</h3>
          <p>We never save your files, and we absolutely never save your password. Since we do not record the password, please make sure you memorize it—as it cannot be recovered if lost.</p>
        </div>`,

    'json-to-csv.html': `
        <h2 class="seo-title">JSON to CSV: Instantly Flatten API Data</h2>
        <div style="margin-top: 30px; line-height: 1.8; color: var(--text-gray);">
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">What is JSON to CSV?</h3>
          <p>Developers and Analysts frequently work with JSON formats exported from APIs and Databases. This tool instantly converts those nested objects and arrays into a flat, readable CSV (Comma Separated Values) spreadsheet file that can be opened in Excel, Numbers, or Google Sheets.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Smart Parsing Technology</h3>
          <p>Our engine automatically reads the keys in your JSON dataset and translates them into perfect column headers, while mapping each object's values cleanly into respective rows—automatically escaping rogue commas and quotes within the data.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Uncompromised Data Safety</h3>
          <p>Convert your sensitive database logs without fear. We handle massive text processing strictly in a secure memory buffer, and flush away your data once the CSV export is constructed and downloaded.</p>
        </div>`,

    'csv-to-excel.html': `
        <h2 class="seo-title">CSV to Excel: Format Plain Text Data</h2>
        <div style="margin-top: 30px; line-height: 1.8; color: var(--text-gray);">
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Why Convert CSV Data?</h3>
          <p>CSV is great for simple storage, but it lacks the visual and functional capabilities of a full spreadsheet. By converting raw CSV text into Microsoft Excel (XLSX) format, you unlock advanced formatting, graphing, multiple-sheet support, and functional data filtering.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Perfect Import Consistency</h3>
          <p>We handle the heavy lifting parsing delimiters, managing character encodings, and importing the data directly into a finalized spreadsheet architecture. Forget manual Excel import wizards, just upload and get your file.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Immediate and Free</h3>
          <p>The conversion natively processes massive plain-text arrays in seconds. Simply upload, get the generated Excel file structure, and trust that your financial or statistical lists are dealt with securely.</p>
        </div>`,

    'excel-to-csv.html': `
        <h2 class="seo-title">Excel to CSV: Data Extraction Simplified</h2>
        <div style="margin-top: 30px; line-height: 1.8; color: var(--text-gray);">
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Export Spreadsheets into Plain Text</h3>
          <p>Often, web applications, CRM databases, or coding frameworks require data to be imported exclusively through CSV. This tool strips the visual formats from an Excel (XLSX) file and turns it into clean, standard, comma-separated code.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Fast Delimiter Structuring</h3>
          <p>By extracting exactly what is written in the cell grid, we provide a universally readable standard text file. It allows for ultra-fast manipulation for web environments that cannot natively parse heavy Excel binaries.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Guaranteed Data Accuracy</h3>
          <p>We ensure that rows match natively, numbers retain validity, and the textual output reflects your worksheet without any third-party app requirements or complicated desktop actions.</p>
        </div>`,

    'excel-to-pdf.html': `
        <h2 class="seo-title">Excel to PDF: Freeze Spreadsheet Layouts</h2>
        <div style="margin-top: 30px; line-height: 1.8; color: var(--text-gray);">
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Static Document Snapshots</h3>
          <p>Worksheets can look dramatically different depending on what version of software a client uses. To send an invoice, chart, or financial table that looks exactly the same everywhere, convert your Excel files into uneditable PDF visuals.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Formatting Integrity</h3>
          <p>We translate the exact width of your cells, borders, color-fill structures, and charts into vector-based PDF imagery, guaranteeing absolute fidelity and a highly professional look.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Secure Online Process</h3>
          <p>Our zero-retention service takes your XLSX documents, translates them natively into PDF structure on our secure servers, and delivers them back smoothly. Perfect for immediate corporate handoffs and audits.</p>
        </div>`,

    'pdf-to-excel.html': `
        <h2 class="seo-title">PDF to Excel: Extract Tables Effortlessly</h2>
        <div style="margin-top: 30px; line-height: 1.8; color: var(--text-gray);">
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Unlock Data from PDFs</h3>
          <p>Receiving tables locked inside a PDF file often forces people to manually re-type massive blocks of data into an Excel spreadsheet. This tool natively extracts and recreates those tables immediately in XLSX format.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Advanced Row detection</h3>
          <p>Our parsing system finds visual gridlines, text-spacing, and aligned columns inside the PDF to rebuild full Excel tables with structural and numerical accuracy, keeping rows and data separated appropriately.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Private and Productive</h3>
          <p>Skip the grueling copy-paste grind. Convert your files immediately through our secure, automated network, ensuring absolute data security as the system clears the buffer right after extraction.</p>
        </div>`,

    'pdf-to-jpg.html': `
        <h2 class="seo-title">PDF to JPG: Transform Pages to Images</h2>
        <div style="margin-top: 30px; line-height: 1.8; color: var(--text-gray);">
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Vector to Raster Conversion</h3>
          <p>Sometimes you need to embed a PDF page into a web design, social media post, or presentation slides. Converting each page of a PDF document into a high-quality JPG image makes it incredibly versatile.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">High Resolution Renders</h3>
          <p>Our rendering engine pulls the PDF and extracts it exactly as it appears into an optimized, high-fidelity raster graphic without artifacting fonts or blurry images.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Lightning Fast Export</h3>
          <p>No account required. Process multiple pages right inside your browser in a completely secure environment, receive your JPG quickly, and know that all files are removed upon completion.</p>
        </div>`,

    'jpg-to-pdf.html': `
        <h2 class="seo-title">JPG to PDF: Build Documents from Photos</h2>
        <div style="margin-top: 30px; line-height: 1.8; color: var(--text-gray);">
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Turn Snaps into Reports</h3>
          <p>Compiling scanned receipts, white-board photographs, or digital design layouts into one distributable document is easiest done in PDF format. We convert JPG/PNG and bind them natively.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Maintained Aspect Ratios</h3>
          <p>The JPGs are perfectly scaled and placed onto standardized PDF layouts. We maintain the original high resolution and properly center the images, saving you from doing it manually in Word.</p>
          <h3 style="color: var(--text-dark); margin: 25px 0 15px 0;">Secure Online Service</h3>
          <p>Combine files seamlessly without desktop installation. The images are rapidly secured into your final PDF across our encrypted system, providing absolute privacy in an easy-to-download package.</p>
        </div>`
};

async function main() {
    const files = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));

    for (let file of files) {
        if (!seoContentMap[file]) continue;

        const targetFile = path.join(htmlDir, file);
        let htmlStr = fs.readFileSync(targetFile, 'utf8');

        // Due to Cheerio modifying HTML structure aggressively sometimes, let's use it properly
        const $ = cheerio.load(htmlStr);

        let contentObj = seoContentMap[file];
        
        const container = $('.seo-container');
        if (container.length > 0) {
            container.html(contentObj);
            fs.writeFileSync(targetFile, $.html(), 'utf8');
            console.log("Updated: " + file);
        } else {
            console.log("Skipped (No .seo-container): " + file);
        }
    }
}

main().catch(console.error);
