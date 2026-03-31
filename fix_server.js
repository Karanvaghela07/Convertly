const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const newEndpoints = `
// =========================================================
// 12. Protect PDF
// =========================================================
app.post('/api/protect-pdf', upload.single('file'), async (req, res) => {
  const filesToClean = [];
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    filesToClean.push(req.file.path);
    
    const password = req.body.password;
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const mupdf = require('mupdf'); // fallback if you don't use muhammara, or since we installed muhammara:
    const muhammara = require('muhammara');
    const path = require('path');
    
    const outputPath = path.join(__dirname, 'uploads', \`protected_\${Date.now()}.pdf\`);
    
    muhammara.recrypt(req.file.path, outputPath, {
      userPassword: password,
      ownerPassword: password,
      userProtectionFlag: 4
    });
    
    filesToClean.push(outputPath);

    res.download(outputPath, 'protected.pdf', () => cleanupFiles(filesToClean));
  } catch (error) {
    console.error('Protect PDF error:', error);
    cleanupFiles(filesToClean);
    res.status(500).json({ error: 'Failed to protect PDF: ' + error.message });
  }
});

// =========================================================
// 13. JSON to CSV
// =========================================================
app.post('/api/convert/json-to-csv', upload.single('file'), async (req, res) => {
  const filesToClean = [];
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    filesToClean.push(req.file.path);
    const path = require('path');

    const jsonContent = fs.readFileSync(req.file.path, 'utf-8');
    let data;
    try {
      data = JSON.parse(jsonContent);
    } catch(e) {
      return res.status(400).json({ error: 'Invalid JSON file' });
    }
    
    if (!Array.isArray(data)) {
      if (typeof data === 'object' && data !== null) {
        const arrKey = Object.keys(data).find(k => Array.isArray(data[k]));
        if (arrKey) {
          data = data[arrKey];
        } else {
          data = [data]; // Wrap object in array
        }
      } else {
        data = [{ value: data }];
      }
    }
    
    if (data.length === 0) {
      return res.status(400).json({ error: 'JSON array is empty' });
    }

    let headers = new Set();
    data.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach(k => headers.add(k));
      } else {
          headers.add('value');
      }
    });
    const headerArr = Array.from(headers);
    
    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '';
      const stringified = String(str);
      if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\\n')) {
        return '"' + stringified.replace(/"/g, '""') + '"';
      }
      return stringified;
    };
    
    let csvString = headerArr.map(escapeCsv).join(',') + '\\n';
    
    data.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        const row = headerArr.map(h => escapeCsv(item[h]));
        csvString += row.join(',') + '\\n';
      } else {
        csvString += escapeCsv(item) + '\\n';
      }
    });

    const outputPath = path.join(__dirname, 'uploads', \`converted_\${Date.now()}.csv\`);
    fs.writeFileSync(outputPath, csvString, 'utf-8');
    filesToClean.push(outputPath);

    res.download(outputPath, 'converted.csv', () => cleanupFiles(filesToClean));
  } catch (error) {
    console.error('JSON to CSV error:', error);
    cleanupFiles(filesToClean);
    res.status(500).json({ error: 'Conversion failed: ' + error.message });
  }
});
`;

const fallbackMarker = '// SPA fallback';

if (code.includes(fallbackMarker)) {
   let parts = code.split(fallbackMarker);
   let newCode = parts[0] + newEndpoints + '\n// SPA fallback' + parts[1];
   fs.writeFileSync('server.js', newCode);
   console.log('Endpoints added successfully.');
} else {
   console.log('Fallback marker not found. Failed to inject.');
}
