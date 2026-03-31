# 📄 DocConverter - Professional Document Conversion Platform

A modern, professional document converter inspired by iLovePDF with stunning UI/UX design from Dribbble and Awwwards.

## ✨ Features

- **PDF to Word** - Convert PDF files to editable Word documents
- **Word to PDF** - Convert Word documents to PDF format
- **Merge PDF** - Combine multiple PDFs into one
- **Split PDF** - Extract specific pages from PDFs
- **Compress PDF** - Reduce PDF file size
- **PDF to JPG** - Convert PDF pages to images
- **JPG to PDF** - Convert images to PDF

## 🎨 Design Features

- Modern, clean UI inspired by iLovePDF
- Smooth animations and transitions
- Responsive design for all devices
- Drag-and-drop file upload
- Real-time progress indicators
- Professional color scheme and typography

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Install Backend Dependencies**
```bash
cd backend
npm install
```

2. **Install Frontend Dependencies**
```bash
cd backend/frontend
npm install
```

### Running the Application

1. **Start the Backend Server**
```bash
cd backend
npm start
```
The server will run on `http://localhost:3000`

2. **Start the Frontend Development Server** (in a new terminal)
```bash
cd backend/frontend
npm start
```
The frontend will run on `http://localhost:4200`

3. **Build for Production**
```bash
cd backend/frontend
npm run build
```
Then start the backend server which will serve the built frontend.

## 📁 Project Structure

```
├── backend/
│   ├── frontend/          # Angular frontend application
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── pages/           # Individual converter pages
│   │   │   │   ├── components/      # Reusable components
│   │   │   │   └── services/        # API services
│   │   │   └── styles.css           # Global styles
│   │   └── package.json
│   ├── uploads/           # Temporary file storage
│   ├── server.js          # Express backend server
│   └── package.json
└── README.md
```

## 🛠️ Technology Stack

### Frontend
- **Angular 21** - Modern web framework
- **TypeScript** - Type-safe JavaScript
- **CSS3** - Custom styling with animations
- **RxJS** - Reactive programming

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Multer** - File upload handling
- **pdf-lib** - PDF manipulation
- **sharp** - Image processing
- **mammoth** - DOCX processing
- **archiver** - ZIP file creation

## 🎯 Key Features

### User Experience
- Drag-and-drop file upload
- Real-time conversion progress
- Automatic file download
- Clean, intuitive interface
- Mobile-responsive design

### Security
- Files automatically deleted after processing
- Secure file handling
- No data retention

### Performance
- Fast conversion processing
- Optimized file handling
- Efficient memory management

## 📝 API Endpoints

- `POST /api/convert/pdf-to-docx` - Convert PDF to Word
- `POST /api/convert/docx-to-pdf` - Convert Word to PDF
- `POST /api/convert/pdf-to-jpg` - Convert PDF to images
- `POST /api/convert/jpg-to-pdf` - Convert images to PDF
- `POST /api/merge-pdf` - Merge multiple PDFs
- `POST /api/split-pdf` - Split PDF pages
- `POST /api/compress-pdf` - Compress PDF file

## 🎨 Design Inspiration

This project draws inspiration from:
- **iLovePDF** - Functionality and user flow
- **Dribbble** - Modern UI patterns and components
- **Awwwards** - Animation and interaction design

## 🔧 Configuration

### File Size Limits
Default maximum file size: 50MB
To change, modify the multer configuration in `backend/server.js`:

```javascript
const upload = multer({ 
  storage, 
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});
```

### Port Configuration
Default ports:
- Backend: 3000
- Frontend Dev: 4200

To change backend port, set the `PORT` environment variable:
```bash
PORT=8080 npm start
```

## 📦 Building for Production

1. Build the frontend:
```bash
cd backend/frontend
npm run build
```

2. The built files will be in `backend/frontend/dist/frontend/browser`

3. Start the backend server:
```bash
cd backend
npm start
```

4. Access the application at `http://localhost:3000`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- iLovePDF for inspiration
- Dribbble community for design patterns
- Awwwards for interaction design ideas
- Angular team for the amazing framework

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

Made with ❤️ using Angular and Node.js
