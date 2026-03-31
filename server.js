require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const sharp = require('sharp');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const PORT = process.env.PORT || 3000;

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://vaghelakaran8599_db_user:dIoeTxf1dejIjSBI@cluster0.1dafgg3.mongodb.net/Convertly?retryWrites=true&w=majority&appName=Cluster0";
const JWT_SECRET = process.env.JWT_SECRET || "convertly_super_secret_key_123";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

// Initialize Google OAuth2 Client
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Atlas Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatarUrl: { type: String, default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

// Middleware - Enable CORS for all origins (production-ready)
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    // Allow all origins for file conversion API
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://convertlyyy.netlify.app',
      'https://convertly.netlify.app'
    ];
    
    // Allow any netlify.app subdomain or localhost
    if (allowedOrigins.includes(origin) || 
        origin.endsWith('.netlify.app') || 
        origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // Allow all origins for public API
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition', 'X-File-Type']
}));

// Handle preflight OPTIONS requests explicitly
app.options('*', cors());

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// =========================================================
// AUTHENTICATION ENDPOINTS
// =========================================================

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ success: true, user: { name: user.name, email: user.email, avatarUrl: user.avatarUrl } });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed: ' + err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ success: true, user: { name: user.name, email: user.email, avatarUrl: user.avatarUrl } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

app.get('/api/auth/me', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ loggedIn: false });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ loggedIn: true, user: decoded });
  } catch (err) {
    res.json({ loggedIn: false });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// =========================================================
// GOOGLE OAUTH ENDPOINT
// =========================================================
app.get('/api/config/google-client-id', (req, res) => {
  const clientId = GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
  res.json({ clientId });
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token required' });

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name,
        email,
        password: '', // Google users don't have passwords
        avatarUrl: picture || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
      });
      await user.save();
    } else {
      // Update avatar if it changed
      if (picture && user.avatarUrl !== picture) {
        user.avatarUrl = picture;
        await user.save();
      }
    }

    // Create JWT token
    const jwtToken = jwt.sign(
      { id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', jwtToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Invalid token or authentication failed' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e6) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Helper: clean up files
const cleanupFiles = (files) => {
  files.forEach(f => {
    try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch (e) { /* ignore */ }
  });
};

// Helper: wrap text into lines that fit within a given width
function wrapText(text, maxCharsPerLine) {
  const lines = [];
  const paragraphs = text.split('\n');
  for (const para of paragraphs) {
    if (para.trim() === '') { lines.push(''); continue; }
    const words = para.split(/\s+/);
    let currentLine = '';
    for (const word of words) {
      if ((currentLine + ' ' + word).trim().length > maxCharsPerLine) {
        if (currentLine) lines.push(currentLine.trim());
        currentLine = word;
      } else {
        currentLine = currentLine ? currentLine + ' ' + word : word;
      }
    }
    if (currentLine) lines.push(currentLine.trim());
  }
  return lines;
}

// =========================================================
// 1. PDF to DOCX  (uses mupdf for accurate text extraction)
// =========================================================
app.post('/api/convert/pdf-to-docx', upload.single('file'), async (req, res) => {
  const filesToClean = [];
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    filesToClean.push(req.file.path);

    const mupdf = await import('mupdf');
    const { Document, Packer, Paragraph, TextRun, PageBreak } = require('docx');

    // Open PDF with mupdf and extract text page by page
    const fileBuffer = fs.readFileSync(req.file.path);
    const doc = mupdf.Document.openDocument(fileBuffer, 'application/pdf');
    const pageCount = doc.countPages();

    const allChildren = [];

    for (let i = 0; i < pageCount; i++) {
      const page = doc.loadPage(i);
      const text = page.toStructuredText('preserve-whitespace').asText();

      if (text && text.trim()) {
        const lines = text.split('\n');
        for (const line of lines) {
          allChildren.push(
            new Paragraph({
              children: [new TextRun({ text: line || ' ', size: 24 })],
              spacing: { after: 80 }
            })
          );
        }
      }

      // Page break between pages (not after the last one)
      if (i < pageCount - 1) {
        allChildren.push(
          new Paragraph({
            children: [new PageBreak()]
          })
        );
      }
    }

    // If no text was found at all
    if (allChildren.length === 0) {
      allChildren.push(
        new Paragraph({
          children: [new TextRun({
            text: '[This PDF contains images/scanned content. Text extraction is not possible for scanned documents.]',
            size: 24,
            italics: true
          })]
        })
      );
    }

    const docx = new Document({
      sections: [{ children: allChildren }]
    });

    const buffer = await Packer.toBuffer(docx);
    const outputPath = path.join(uploadsDir, `converted_${Date.now()}.docx`);
    fs.writeFileSync(outputPath, buffer);
    filesToClean.push(outputPath);

    console.log(`PDF to DOCX: ${pageCount} pages, ${allChildren.length} paragraphs extracted`);
    res.download(outputPath, 'converted.docx', () => cleanupFiles(filesToClean));
  } catch (error) {
    console.error('PDF to DOCX error:', error);
    cleanupFiles(filesToClean);
    res.status(500).json({ error: 'Conversion failed: ' + error.message });
  }
});

// =========================================================
// 2. DOCX to PDF
// =========================================================
app.post('/api/convert/docx-to-pdf', upload.single('file'), async (req, res) => {
  const filesToClean = [];
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    filesToClean.push(req.file.path);

    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: req.file.path });
    let text = result.value || '';
    
    // Remove emojis and non-printable characters that WinAnsi can't encode
    // Keep only basic ASCII and common extended Latin characters
    text = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Emojis
               .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
               .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
               .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation selectors
               .replace(/[\u{1F000}-\u{1FFFF}]/gu, '') // More emojis
               .replace(/[^\x00-\x7F\xA0-\xFF]/g, ''); // Keep only Latin-1

    // Create a multi-page PDF with proper text wrapping
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 11;
    const margin = 50;
    const pageWidth = 595; // A4
    const pageHeight = 842;
    const usableWidth = pageWidth - 2 * margin;
    const maxCharsPerLine = Math.floor(usableWidth / (fontSize * 0.52));
    const lineHeight = fontSize * 1.5;

    const allLines = wrapText(text, maxCharsPerLine);

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let yPos = pageHeight - margin;

    for (const line of allLines) {
      if (yPos < margin + lineHeight) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        yPos = pageHeight - margin;
      }
      // Additional safety: filter each line for safe characters
      const safeLine = line.replace(/[^\x20-\x7E\xA0-\xFF]/g, '');
      page.drawText(safeLine, { x: margin, y: yPos, size: fontSize, font, color: rgb(0, 0, 0) });
      yPos -= lineHeight;
    }

    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(uploadsDir, `converted_${Date.now()}.pdf`);
    fs.writeFileSync(outputPath, pdfBytes);
    filesToClean.push(outputPath);

    res.download(outputPath, 'converted.pdf', () => cleanupFiles(filesToClean));
  } catch (error) {
    console.error('DOCX to PDF error:', error);
    cleanupFiles(filesToClean);
    res.status(500).json({ error: 'Conversion failed: ' + error.message });
  }
});

// =========================================================
// 3. PDF to JPG  (uses mupdf for real PDF rendering)
// =========================================================
app.post('/api/convert/pdf-to-jpg', upload.single('file'), async (req, res) => {
  const filesToClean = [];
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    filesToClean.push(req.file.path);

    const mupdf = await import('mupdf');

    const fileBuffer = fs.readFileSync(req.file.path);
    const doc = mupdf.Document.openDocument(fileBuffer, 'application/pdf');
    const pageCount = doc.countPages();
    const jpgBuffers = [];

    for (let i = 0; i < pageCount; i++) {
      const page = doc.loadPage(i);

      // Render at 2x scale for high quality
      const matrix = mupdf.Matrix.scale(2, 2);
      const pixmap = page.toPixmap(matrix, mupdf.ColorSpace.DeviceRGB, false, true);
      const pngBuffer = pixmap.asPNG();

      // Convert PNG to JPG using sharp
      const jpgBuffer = await sharp(Buffer.from(pngBuffer))
        .jpeg({ quality: 92 })
        .toBuffer();
      jpgBuffers.push({ buffer: jpgBuffer, name: `page_${i + 1}.jpg` });
    }

    // Always send individual JPG files directly (not zipped)
    // For single page: send the JPG directly
    // For multiple pages: also send individual JPGs in a zip that actually works
    if (jpgBuffers.length === 1) {
      // Single page - send JPG directly
      const originalName = req.file.originalname.replace(/\.pdf$/i, '');
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Disposition', `attachment; filename="${originalName}.jpg"`);
      res.setHeader('X-File-Type', 'jpg');
      res.send(jpgBuffers[0].buffer);
      // Cleanup uploaded PDF
      cleanupFiles(filesToClean);
    } else {
      // Multiple pages - create zip properly with buffers (not file paths)
      const zipPath = path.join(uploadsDir, `pdf_images_${Date.now()}.zip`);
      filesToClean.push(zipPath);

      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 5 } });

      // Handle archive errors properly
      archive.on('error', (err) => {
        console.error('Archive error:', err);
        cleanupFiles(filesToClean);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to create zip file' });
        }
      });

      output.on('error', (err) => {
        console.error('Output stream error:', err);
        cleanupFiles(filesToClean);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to write zip file' });
        }
      });

      output.on('close', () => {
        const originalName = req.file.originalname.replace(/\.pdf$/i, '');
        res.setHeader('X-File-Type', 'zip');
        res.download(zipPath, `${originalName}_images.zip`, (err) => {
          if (err) console.error('Download error:', err);
          cleanupFiles(filesToClean);
        });
      });

      archive.pipe(output);

      // Add buffers directly to archive (more reliable than file paths)
      jpgBuffers.forEach((item, idx) => {
        archive.append(item.buffer, { name: item.name });
      });

      await archive.finalize();
    }

    console.log(`PDF to JPG: ${pageCount} pages rendered`);
  } catch (error) {
    console.error('PDF to JPG error:', error);
    cleanupFiles(filesToClean);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Conversion failed: ' + error.message });
    }
  }
});

// =========================================================
// 4. JPG / Image to PDF
// =========================================================
app.post('/api/convert/jpg-to-pdf', upload.array('files', 50), async (req, res) => {
  const filesToClean = [];
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });
    req.files.forEach(f => filesToClean.push(f.path));

    const pdfDoc = await PDFDocument.create();

    for (const file of req.files) {
      const imageBuffer = fs.readFileSync(file.path);
      const ext = path.extname(file.originalname).toLowerCase();

      // Convert any image to PNG first using sharp for consistency
      let processedBuffer;
      let image;

      if (ext === '.png') {
        processedBuffer = imageBuffer;
        image = await pdfDoc.embedPng(processedBuffer);
      } else {
        // Convert to JPEG if not already
        processedBuffer = await sharp(imageBuffer).jpeg({ quality: 95 }).toBuffer();
        image = await pdfDoc.embedJpg(processedBuffer);
      }

      // Create page sized to image (max A4, scale down if larger)
      const maxW = 595;
      const maxH = 842;
      let w = image.width;
      let h = image.height;
      const scale = Math.min(maxW / w, maxH / h, 1);
      w *= scale;
      h *= scale;

      const page = pdfDoc.addPage([w, h]);
      page.drawImage(image, { x: 0, y: 0, width: w, height: h });
    }

    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(uploadsDir, `images_to_pdf_${Date.now()}.pdf`);
    fs.writeFileSync(outputPath, pdfBytes);
    filesToClean.push(outputPath);

    res.download(outputPath, 'converted.pdf', () => cleanupFiles(filesToClean));
  } catch (error) {
    console.error('JPG to PDF error:', error);
    cleanupFiles(filesToClean);
    res.status(500).json({ error: 'Conversion failed: ' + error.message });
  }
});

// =========================================================
// 5. Merge PDF
// =========================================================
app.post('/api/merge-pdf', upload.array('files', 50), async (req, res) => {
  const filesToClean = [];
  try {
    if (!req.files || req.files.length < 2) return res.status(400).json({ error: 'Please upload at least 2 PDF files' });
    req.files.forEach(f => filesToClean.push(f.path));

    const mergedPdf = await PDFDocument.create();

    for (const file of req.files) {
      const pdfBytes = fs.readFileSync(file.path);
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach(page => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    const outputPath = path.join(uploadsDir, `merged_${Date.now()}.pdf`);
    fs.writeFileSync(outputPath, mergedPdfBytes);
    filesToClean.push(outputPath);

    res.download(outputPath, 'merged.pdf', () => cleanupFiles(filesToClean));
  } catch (error) {
    console.error('Merge PDF error:', error);
    cleanupFiles(filesToClean);
    res.status(500).json({ error: 'Merge failed: ' + error.message });
  }
});

// =========================================================
// 6. Split PDF
// =========================================================
app.post('/api/split-pdf', upload.single('file'), async (req, res) => {
  const filesToClean = [];
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    filesToClean.push(req.file.path);

    const pages = req.body.pages || req.query.pages;
    if (!pages) return res.status(400).json({ error: 'Please specify page ranges (e.g. 1-3,5,7-9)' });

    const pdfBytes = fs.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const totalPages = pdfDoc.getPageCount();

    // Parse page range
    const pageNumbers = [];
    const ranges = pages.split(',');
    for (const range of ranges) {
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(n => parseInt(n.trim()));
        for (let i = start; i <= Math.min(end, totalPages); i++) {
          pageNumbers.push(i - 1);
        }
      } else {
        const num = parseInt(range.trim());
        if (num >= 1 && num <= totalPages) pageNumbers.push(num - 1);
      }
    }

    if (pageNumbers.length === 0) return res.status(400).json({ error: 'Invalid page range' });

    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdfDoc, pageNumbers);
    copiedPages.forEach(page => newPdf.addPage(page));

    const newPdfBytes = await newPdf.save();
    const outputPath = path.join(uploadsDir, `split_${Date.now()}.pdf`);
    fs.writeFileSync(outputPath, newPdfBytes);
    filesToClean.push(outputPath);

    res.download(outputPath, 'split.pdf', () => cleanupFiles(filesToClean));
  } catch (error) {
    console.error('Split PDF error:', error);
    cleanupFiles(filesToClean);
    res.status(500).json({ error: 'Split failed: ' + error.message });
  }
});

// =========================================================
// 7. Compress PDF
// =========================================================
app.post('/api/compress-pdf', upload.single('file'), async (req, res) => {
  const filesToClean = [];
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    filesToClean.push(req.file.path);

    const pdfBytes = fs.readFileSync(req.file.path);
    const originalSize = pdfBytes.length;
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50
    });

    const outputPath = path.join(uploadsDir, `compressed_${Date.now()}.pdf`);
    fs.writeFileSync(outputPath, compressedBytes);
    filesToClean.push(outputPath);

    // Send compression stats in headers
    res.set('X-Original-Size', originalSize.toString());
    res.set('X-Compressed-Size', compressedBytes.length.toString());
    res.set('Access-Control-Expose-Headers', 'X-Original-Size, X-Compressed-Size');

    res.download(outputPath, 'compressed.pdf', () => cleanupFiles(filesToClean));
  } catch (error) {
    console.error('Compress PDF error:', error);
    cleanupFiles(filesToClean);
    res.status(500).json({ error: 'Compression failed: ' + error.message });
  }
});

// =========================================================
// 8. Compress Image
// =========================================================
app.post('/api/compress-image', upload.single('file'), async (req, res) => {
  const filesToClean = [];
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    filesToClean.push(req.file.path);

    const originalSize = fs.statSync(req.file.path).size;
    const outputPath = path.join(uploadsDir, `compressed_${Date.now()}.jpg`);
    
    // Convert and compress to JPEG using sharp
    await sharp(req.file.path)
      .jpeg({ quality: 65 }) // adjust quality as needed
      .toFile(outputPath);
      
    filesToClean.push(outputPath);

    const compressedSize = fs.statSync(outputPath).size;
    
    res.set('X-Original-Size', originalSize.toString());
    res.set('X-Compressed-Size', compressedSize.toString());
    res.set('Access-Control-Expose-Headers', 'X-Original-Size, X-Compressed-Size');

    res.download(outputPath, 'compressed.jpg', () => cleanupFiles(filesToClean));
  } catch (error) {
    console.error('Compress Image error:', error);
    cleanupFiles(filesToClean);
    res.status(500).json({ error: 'Compression failed: ' + error.message });
  }
});

// =========================================================
// 9. Excel to PDF
// =========================================================
app.post('/api/convert/excel-to-pdf', upload.single('file'), async (req, res) => {
  const filesToClean = [];
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    filesToClean.push(req.file.path);

    const XLSX = require('xlsx');
    const workbook = XLSX.readFile(req.file.path);
    
    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Courier);
    const boldFont = await pdfDoc.embedFont(StandardFonts.CourierBold);
    const fontSize = 8;
    const margin = 30;
    const pageWidth = 842; // A4 Landscape for better table fit
    const pageHeight = 595;
    const lineHeight = fontSize * 1.6;
    const cellPadding = 3;

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      
      if (data.length === 0) continue;

      // Calculate the number of columns
      const colCount = Math.max(...data.map(row => Array.isArray(row) ? row.length : 0), 1);
      const availableWidth = pageWidth - 2 * margin;
      
      // Calculate column widths based on content
      const colWidths = [];
      for (let colIdx = 0; colIdx < colCount; colIdx++) {
        let maxWidth = 30; // minimum width
        for (const row of data) {
          if (Array.isArray(row) && row[colIdx] !== undefined) {
            const cellText = String(row[colIdx]);
            const textWidth = Math.min(cellText.length * 5, 150); // Approximate width
            maxWidth = Math.max(maxWidth, textWidth);
          }
        }
        colWidths.push(maxWidth);
      }
      
      // Normalize column widths to fit page
      const totalWidth = colWidths.reduce((a, b) => a + b, 0);
      const scaleFactor = totalWidth > availableWidth ? availableWidth / totalWidth : 1;
      const scaledColWidths = colWidths.map(w => Math.max(w * scaleFactor, 25));

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let yPos = pageHeight - margin;

      // Draw sheet name as title
      const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      page.drawText(`Sheet: ${sheetName}`, { x: margin, y: yPos, size: 14, font: titleFont, color: rgb(0, 0, 0) });
      yPos -= 30;

      for (let rowIdx = 0; rowIdx < data.length; rowIdx++) {
        const row = data[rowIdx];
        if (!Array.isArray(row)) continue;
        
        // Check if we need a new page
        if (yPos < margin + lineHeight + 10) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          yPos = pageHeight - margin;
        }

        let xPos = margin;
        const isHeader = rowIdx === 0;
        
        for (let colIdx = 0; colIdx < colCount; colIdx++) {
          const colWidth = scaledColWidths[colIdx] || 50;
          const cellValue = colIdx < row.length ? String(row[colIdx] ?? '') : '';
          
          // Calculate max chars that fit in cell
          const maxChars = Math.floor((colWidth - 2 * cellPadding) / 4.5);
          const displayValue = cellValue.length > maxChars ? cellValue.substring(0, maxChars - 1) + '…' : cellValue;
          
          // Draw cell background for header row
          if (isHeader) {
            page.drawRectangle({
              x: xPos,
              y: yPos - lineHeight,
              width: colWidth,
              height: lineHeight,
              color: rgb(0.2, 0.4, 0.6)
            });
          }
          
          // Draw cell border
          page.drawRectangle({
            x: xPos,
            y: yPos - lineHeight,
            width: colWidth,
            height: lineHeight,
            borderColor: rgb(0.7, 0.7, 0.7),
            borderWidth: 0.5
          });
          
          // Draw cell text
          page.drawText(displayValue, {
            x: xPos + cellPadding,
            y: yPos - lineHeight + cellPadding + 2,
            size: fontSize,
            font: isHeader ? boldFont : font,
            color: isHeader ? rgb(1, 1, 1) : rgb(0, 0, 0)
          });
          
          xPos += colWidth;
        }
        yPos -= lineHeight;
      }
    }

    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(uploadsDir, `excel_${Date.now()}.pdf`);
    fs.writeFileSync(outputPath, pdfBytes);
    filesToClean.push(outputPath);

    res.download(outputPath, 'converted.pdf', () => cleanupFiles(filesToClean));
  } catch (error) {
    console.error('Excel to PDF error:', error);
    cleanupFiles(filesToClean);
    res.status(500).json({ error: 'Conversion failed: ' + error.message });
  }
});

// =========================================================
// 9. PDF to Excel - Extract tabular data from PDF using pdf2table
// =========================================================
app.post('/api/convert/pdf-to-excel', upload.single('file'), async (req, res) => {
  const filesToClean = [];
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    filesToClean.push(req.file.path);

    const pdf2table = require('pdf2table');
    const XLSX = require('xlsx');

    const fileBuffer = fs.readFileSync(req.file.path);
    
    // Use pdf2table to extract table structure from PDF
    pdf2table.parse(fileBuffer, (err, rows, rowsdebug) => {
      if (err) {
        console.error('pdf2table error:', err);
        // Fallback to mupdf text extraction
        fallbackPdfToExcel(req, res, filesToClean);
        return;
      }
      
      if (!rows || rows.length === 0) {
        // No table found, try fallback
        fallbackPdfToExcel(req, res, filesToClean);
        return;
      }
      
      // Create Excel workbook from extracted table rows
      const workbook = XLSX.utils.book_new();
      const sheet = XLSX.utils.aoa_to_sheet(rows);
      
      // Auto-size columns based on content
      const maxCols = Math.max(...rows.map(row => row.length));
      const colWidths = [];
      for (let col = 0; col < maxCols; col++) {
        let maxWidth = 8;
        for (const row of rows) {
          if (row[col]) {
            maxWidth = Math.max(maxWidth, String(row[col]).length);
          }
        }
        colWidths.push({ wch: Math.min(maxWidth + 2, 60) });
      }
      sheet['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1');
      
      const outputPath = path.join(uploadsDir, `extracted_${Date.now()}.xlsx`);
      XLSX.writeFile(workbook, outputPath);
      filesToClean.push(outputPath);
      
      console.log(`PDF to Excel: Extracted ${rows.length} rows`);
      res.download(outputPath, 'extracted.xlsx', () => cleanupFiles(filesToClean));
    });
  } catch (error) {
    console.error('PDF to Excel error:', error);
    cleanupFiles(filesToClean);
    res.status(500).json({ error: 'Conversion failed: ' + error.message });
  }
});

// Fallback function using mupdf text extraction
async function fallbackPdfToExcel(req, res, filesToClean) {
  try {
    const mupdf = await import('mupdf');
    const XLSX = require('xlsx');
    
    const fileBuffer = fs.readFileSync(req.file.path);
    const doc = mupdf.Document.openDocument(fileBuffer, 'application/pdf');
    const pageCount = doc.countPages();
    
    const workbook = XLSX.utils.book_new();
    
    for (let i = 0; i < pageCount; i++) {
      const page = doc.loadPage(i);
      const structuredText = page.toStructuredText('preserve-whitespace');
      const text = structuredText.asText();
      
      const lines = text.split('\n');
      const tableData = [];
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;
        
        let cells;
        if (trimmedLine.includes('\t')) {
          cells = trimmedLine.split('\t').map(c => c.trim());
        } else if (trimmedLine.includes('|')) {
          cells = trimmedLine.split('|').map(c => c.trim()).filter(c => c);
        } else if (trimmedLine.includes('  ')) {
          cells = trimmedLine.split(/\s{2,}/).map(c => c.trim()).filter(c => c);
        } else {
          cells = [trimmedLine];
        }
        
        if (cells.length > 0) {
          tableData.push(cells);
        }
      }
      
      if (tableData.length > 0) {
        const maxCols = Math.max(...tableData.map(row => row.length));
        const normalizedData = tableData.map(row => {
          const newRow = [...row];
          while (newRow.length < maxCols) newRow.push('');
          return newRow;
        });
        
        const sheet = XLSX.utils.aoa_to_sheet(normalizedData);
        const colWidths = [];
        for (let col = 0; col < maxCols; col++) {
          let maxWidth = 8;
          for (const row of normalizedData) {
            if (row[col]) {
              maxWidth = Math.max(maxWidth, String(row[col]).length);
            }
          }
          colWidths.push({ wch: Math.min(maxWidth + 2, 60) });
        }
        sheet['!cols'] = colWidths;
        
        XLSX.utils.book_append_sheet(workbook, sheet, `Page ${i + 1}`);
      }
    }
    
    if (workbook.SheetNames.length === 0) {
      const sheet = XLSX.utils.aoa_to_sheet([['No text content found in this PDF']]);
      XLSX.utils.book_append_sheet(workbook, sheet, 'Page 1');
    }
    
    const outputPath = path.join(uploadsDir, `extracted_${Date.now()}.xlsx`);
    XLSX.writeFile(workbook, outputPath);
    filesToClean.push(outputPath);
    
    res.download(outputPath, 'extracted.xlsx', () => cleanupFiles(filesToClean));
  } catch (error) {
    console.error('Fallback PDF to Excel error:', error);
    cleanupFiles(filesToClean);
    res.status(500).json({ error: 'Conversion failed: ' + error.message });
  }
}

// =========================================================
// 10. CSV to Excel
// =========================================================
app.post('/api/convert/csv-to-excel', upload.single('file'), async (req, res) => {
  const filesToClean = [];
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    filesToClean.push(req.file.path);

    const XLSX = require('xlsx');
    
    // Read CSV file
    const csvContent = fs.readFileSync(req.file.path, 'utf-8');
    
    // Parse CSV
    const workbook = XLSX.read(csvContent, { type: 'string' });
    
    // Write as XLSX
    const outputPath = path.join(uploadsDir, `converted_${Date.now()}.xlsx`);
    XLSX.writeFile(workbook, outputPath);
    filesToClean.push(outputPath);

    res.download(outputPath, 'converted.xlsx', () => cleanupFiles(filesToClean));
  } catch (error) {
    console.error('CSV to Excel error:', error);
    cleanupFiles(filesToClean);
    res.status(500).json({ error: 'Conversion failed: ' + error.message });
  }
});

// =========================================================
// 11. Excel to CSV
// =========================================================
app.post('/api/convert/excel-to-csv', upload.single('file'), async (req, res) => {
  const filesToClean = [];
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    filesToClean.push(req.file.path);

    const XLSX = require('xlsx');
    
    const workbook = XLSX.readFile(req.file.path);
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    
    // Convert to CSV
    const csvContent = XLSX.utils.sheet_to_csv(sheet);
    
    const outputPath = path.join(uploadsDir, `converted_${Date.now()}.csv`);
    fs.writeFileSync(outputPath, csvContent, 'utf-8');
    filesToClean.push(outputPath);

    res.download(outputPath, 'converted.csv', () => cleanupFiles(filesToClean));
  } catch (error) {
    console.error('Excel to CSV error:', error);
    cleanupFiles(filesToClean);
    res.status(500).json({ error: 'Conversion failed: ' + error.message });
  }
});

// =========================================================

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

    const muhammara = require('muhammara');
    const path = require('path');
    
    const outputPath = path.join(__dirname, 'uploads', `protected_${Date.now()}.pdf`);
    
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
      if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
        return '"' + stringified.replace(/"/g, '""') + '"';
      }
      return stringified;
    };
    
    let csvString = headerArr.map(escapeCsv).join(',') + '\n';
    
    data.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        const row = headerArr.map(h => escapeCsv(item[h]));
        csvString += row.join(',') + '\n';
      } else {
        csvString += escapeCsv(item) + '\n';
      }
    });

    const outputPath = path.join(__dirname, 'uploads', `converted_${Date.now()}.csv`);
    fs.writeFileSync(outputPath, csvString, 'utf-8');
    filesToClean.push(outputPath);

    res.download(outputPath, 'converted.csv', () => cleanupFiles(filesToClean));
  } catch (error) {
    console.error('JSON to CSV error:', error);
    cleanupFiles(filesToClean);
    res.status(500).json({ error: 'Conversion failed: ' + error.message });
  }
});

// =========================================================
// 14. Add Watermark to PDF
// =========================================================
app.post('/api/add-watermark', upload.single('file'), async (req, res) => {
  const filesToClean = [];
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    filesToClean.push(req.file.path);
    
    // get watermark settings
    const watermarkText = req.body.watermark || req.body.watermark_text || 'CONFIDENTIAL';
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
    
    const outputPath = path.join(__dirname, 'uploads', `watermarked_${Date.now()}.pdf`);
    fs.writeFileSync(outputPath, pdfBytes);
    filesToClean.push(outputPath);

    res.download(outputPath, 'Watermarked.pdf', () => cleanupFiles(filesToClean));
  } catch (error) {
    console.error('Watermark error:', error);
    cleanupFiles(filesToClean);
    res.status(500).json({ error: 'Failed to add watermark: ' + error.message });
  }
});

// SPA fallback – serve index.html for all non-API routes
// =========================================================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Convertly running on http://localhost:${PORT}`);
  console.log(`📄 All converters ready`);
});
