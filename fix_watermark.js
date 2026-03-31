const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');
const startIdx = code.indexOf('// 14. AI PDF Summarizer');
const splitPoint = code.indexOf('// SPA fallback');

if (startIdx !== -1 && splitPoint !== -1) {
  const newEndpoint = `// 14. Add Watermark to PDF
// =========================================================
app.post('/api/add-watermark', upload.single('file'), async (req, res) => {
  const filesToClean = [];
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    filesToClean.push(req.file.path);
    
    // get watermark settings
    const watermarkText = req.body.watermark_text || 'CONFIDENTIAL';
    const watermarkColorHex = req.body.watermark_color || '#ff0000'; // red by default
    
    // Extract RGB from hex
    const hex = watermarkColorHex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255 || 0;
    const g = parseInt(hex.substring(2, 4), 16) / 255 || 0;
    const b = parseInt(hex.substring(4, 6), 16) / 255 || 0;
    
    const { PDFDocument, rgb, degrees, StandardFonts } = require('pdf-lib');
    const path = require('path');
    
    const existingPdfBytes = fs.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const { width, height } = page.getSize();
      page.drawText(watermarkText, {
        x: width / 2 - (watermarkText.length * 15),
        y: height / 2,
        size: 50,
        font: helveticaFont,
        color: rgb(r, g, b),
        opacity: 0.3,
        rotate: degrees(45),
      });
    }
    
    const pdfBytes = await pdfDoc.save();
    
    const outputPath = path.join(__dirname, 'uploads', \`watermarked_\${Date.now()}.pdf\`);
    fs.writeFileSync(outputPath, pdfBytes);
    filesToClean.push(outputPath);

    res.download(outputPath, 'Watermarked.pdf', () => cleanupFiles(filesToClean));
  } catch (error) {
    console.error('Watermark error:', error);
    cleanupFiles(filesToClean);
    res.status(500).json({ error: 'Failed to add watermark: ' + error.message });
  }
});

`;
  
  const before = code.substring(0, startIdx);
  const after = code.substring(splitPoint);
  fs.writeFileSync('server.js', before + newEndpoint + after);
  console.log("Replaced AI with Watermark successfully.");
} else {
  console.log("Could not find the injection points", startIdx, splitPoint);
}
