// ===== Convertly Frontend App =====

// API Base URL - Your Render backend URL
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? '' // Local development - same origin
  : 'https://convertly-hv1o.onrender.com'; // Production - Render backend

// Tool configurations
const TOOLS = {
  'pdf-to-docx': {
    title: 'PDF to Word',
    subtitle: 'Upload your PDF file to convert it to an editable Word document',
    accept: '.pdf',
    multiple: false,
    endpoint: API_BASE_URL + '/api/convert/pdf-to-docx',
    fieldName: 'file',
    outputName: 'converted.docx'
  },
  'docx-to-pdf': {
    title: 'Word to PDF',
    subtitle: 'Upload your Word document to convert it to PDF format',
    accept: '.docx,.doc',
    multiple: false,
    endpoint: API_BASE_URL + '/api/convert/docx-to-pdf',
    fieldName: 'file',
    outputName: 'converted.pdf'
  },
  'pdf-to-jpg': {
    title: 'PDF to JPG',
    subtitle: 'Upload your PDF file to extract pages as JPG images',
    accept: '.pdf',
    multiple: false,
    endpoint: API_BASE_URL + '/api/convert/pdf-to-jpg',
    fieldName: 'file',
    outputName: 'pdf_images.zip'
  },
  'jpg-to-pdf': {
    title: 'JPG to PDF',
    subtitle: 'Upload your images to combine them into a PDF document',
    accept: '.jpg,.jpeg,.png,.webp,.bmp,.gif',
    multiple: true,
    endpoint: API_BASE_URL + '/api/convert/jpg-to-pdf',
    fieldName: 'files',
    outputName: 'converted.pdf'
  },
  'merge-pdf': {
    title: 'Merge PDF',
    subtitle: 'Upload multiple PDF files to combine them into one',
    accept: '.pdf',
    multiple: true,
    endpoint: API_BASE_URL + '/api/merge-pdf',
    fieldName: 'files',
    outputName: 'merged.pdf'
  },
  'split-pdf': {
    title: 'Split PDF',
    subtitle: 'Upload a PDF and specify page ranges to extract',
    accept: '.pdf',
    multiple: false,
    endpoint: API_BASE_URL + '/api/split-pdf',
    fieldName: 'file',
    outputName: 'split.pdf',
    hasPageRange: true
  },
  'compress-image': {
    title: 'Compress Image',
    subtitle: 'Upload your image to reduce its file size',
    accept: 'image/jpeg,image/png,image/webp',
    multiple: false,
    endpoint: API_BASE_URL + '/api/compress-image',
    fieldName: 'file',
    outputName: 'compressed.jpg'
  },
  'compress-pdf': {
    title: 'Compress PDF',
    subtitle: 'Upload your PDF to reduce its file size',
    accept: '.pdf',
    multiple: false,
    endpoint: API_BASE_URL + '/api/compress-pdf',
    fieldName: 'file',
    outputName: 'compressed.pdf'
  },
  'excel-to-pdf': {
    title: 'Excel to PDF',
    subtitle: 'Upload your Excel spreadsheet to convert it to PDF',
    accept: '.xls,.xlsx,.xlsm',
    multiple: false,
    endpoint: API_BASE_URL + '/api/convert/excel-to-pdf',
    fieldName: 'file',
    outputName: 'converted.pdf'
  },
  'pdf-to-excel': {
    title: 'PDF to Excel',
    subtitle: 'Upload your PDF to extract data into an Excel spreadsheet',
    accept: '.pdf',
    multiple: false,
    endpoint: API_BASE_URL + '/api/convert/pdf-to-excel',
    fieldName: 'file',
    outputName: 'extracted.xlsx'
  },
  'csv-to-excel': {
    title: 'CSV to Excel',
    subtitle: 'Upload your CSV file to convert it to Excel format',
    accept: '.csv,.txt',
    multiple: false,
    endpoint: API_BASE_URL + '/api/convert/csv-to-excel',
    fieldName: 'file',
    outputName: 'converted.xlsx'
  },
  'excel-to-csv': {
    title: 'Excel to CSV',
    subtitle: 'Upload your Excel spreadsheet to convert it to CSV format',
    accept: '.xls,.xlsx,.xlsm',
    multiple: false,
    endpoint: API_BASE_URL + '/api/convert/excel-to-csv',
    fieldName: 'file',
    outputName: 'converted.csv'
  },
  'protect-pdf': {
    title: 'Protect PDF',
    subtitle: 'Upload a PDF to encrypt it with a secure password',
    accept: '.pdf',
    multiple: false,
    endpoint: API_BASE_URL + '/api/protect-pdf',
    fieldName: 'file',
    outputName: 'protected.pdf',
    hasExtraInput: true
  },
  'json-to-csv': {
    title: 'JSON to CSV',
    subtitle: 'Upload a JSON file to convert it perfectly to CSV format',
    accept: '.json',
    multiple: false,
    endpoint: API_BASE_URL + '/api/convert/json-to-csv',
    fieldName: 'file',
    outputName: 'converted.csv'
  },
  'add-watermark': {
    title: 'Add Watermark to PDF',
    subtitle: 'Upload your PDF to stamp it with a custom text watermark.',
    accept: '.pdf',
    multiple: false,
    endpoint: API_BASE_URL + '/api/add-watermark',
    fieldName: 'file',
    outputName: 'watermarked.pdf',
    hasExtraInput: true
  }
};

let currentTool = null;
let selectedFiles = [];
let downloadUrl = null;
let downloadName = null;
let originalFileName = null;

// ===== DOM elements (Wrap in optional chaining/checks) =====
const heroSection = document.getElementById('heroSection');
const toolsSection = document.getElementById('tools');
const featuresSection = document.getElementById('featuresSection');
const converterView = document.getElementById('converterView');
const converterTitle = document.getElementById('converterTitle');
const converterSubtitle = document.getElementById('converterSubtitle');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const fileRemove = document.getElementById('fileRemove');
const convertBtn = document.getElementById('convertBtn');
const progressSection = document.getElementById('progressSection');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const successSection = document.getElementById('successSection');
const downloadBtn = document.getElementById('downloadBtn');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');
const extraInput = document.getElementById('extraInput');
const dropHint = document.getElementById('dropHint');

// Set current tool globally based on page attribute
// Set current tool globally based on page attribute
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('active');
      mobileToggle.classList.toggle('active');
    });
  }

  // Dropdown Click Toggle
  const dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach(dropdown => {
    const link = dropdown.querySelector('.nav-link');
    if (link) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Close other dropdowns
        dropdowns.forEach(other => {
          if (other !== dropdown) {
            other.classList.remove('active');
          }
        });
        
        // Toggle current dropdown
        dropdown.classList.toggle('active');
      });
    }
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    // Close mobile menu
    if (navLinks && navLinks.classList.contains('active') && 
        !navLinks.contains(e.target) && !mobileToggle.contains(e.target)) {
      navLinks.classList.remove('active');
      mobileToggle.classList.remove('active');
    }
    
    // Close dropdowns when clicking outside
    if (!e.target.closest('.dropdown')) {
      dropdowns.forEach(dropdown => {
        dropdown.classList.remove('active');
      });
    }
  });

  // Close dropdown when clicking a menu item link
  document.querySelectorAll('.dropdown-menu a').forEach(link => {
    link.addEventListener('click', () => {
      dropdowns.forEach(dropdown => {
        dropdown.classList.remove('active');
      });
    });
  });

  // Scroll Animations using Intersection Observer
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Targets for animation
  const animTargets = document.querySelectorAll('.hero, .tools-section, .trust-section, .how-works-section, .blog-section, .faq-section, .footer, .feature-card, .tool-card, .trust-card, .step-card, .blog-card');
  animTargets.forEach(target => {
    target.classList.add('fade-in-up');
    observer.observe(target);
  });

  const toolContainer = document.getElementById('toolContainer');
  if (toolContainer) {
    currentTool = toolContainer.getAttribute('data-tool');
    const tool = TOOLS[currentTool];
    if (tool && fileInput) {
      fileInput.accept = tool.accept;
      fileInput.multiple = tool.multiple;
      if (extraInput) {
        extraInput.style.display = 'none'; // Only show after file selection
      }
      if (dropHint) {
        if (tool.multiple) dropHint.textContent = 'You can select multiple files • Max 50 MB each';
        else dropHint.textContent = 'Max file size: 50 MB';
      }
    }
  }
});

// (Functions showHome and openTool removed for multi-page architecture)

// ===== Reset converter state =====
function resetConverter() {
  selectedFiles = [];
  fileInput.value = '';
  filePreview.style.display = 'none';
  convertBtn.style.display = 'none';
  progressSection.style.display = 'none';
  successSection.style.display = 'none';
  errorSection.style.display = 'none';
  dropZone.style.display = '';
  extraInput.style.display = 'none';
  progressFill.style.width = '0%';

  // Reset convert button state
  const btnText = convertBtn.querySelector('.convert-btn-text');
  const btnLoader = convertBtn.querySelector('.convert-btn-loader');
  if (btnText) btnText.style.display = '';
  if (btnLoader) btnLoader.style.display = 'none';
  convertBtn.disabled = false;

  if (downloadUrl) {
    URL.revokeObjectURL(downloadUrl);
    downloadUrl = null;
  }
  downloadName = null;
}

// ===== Format file size =====
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ===== Handle file selection =====
function handleFiles(files) {
  if (!files || files.length === 0) return;
  selectedFiles = Array.from(files);

  originalFileName = selectedFiles[0].name;
  if (selectedFiles.length === 1) {
    fileName.textContent = selectedFiles[0].name;
    fileSize.textContent = formatSize(selectedFiles[0].size);
  } else {
    fileName.textContent = `${selectedFiles.length} files selected`;
    const totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);
    fileSize.textContent = formatSize(totalSize);
  }

  dropZone.style.display = 'none';
  filePreview.style.display = '';
  convertBtn.style.display = '';

  const tool = TOOLS[currentTool];
  if (extraInput && tool && (tool.hasPageRange || tool.hasExtraInput)) {
    extraInput.style.display = 'block';
  }
}

// ===== File input change =====
if (fileInput) {
  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
  });
}

// ===== Drag & Drop =====
if (dropZone) {
  dropZone.addEventListener('click', (e) => {
    // Prevent double-open: only trigger file input once
    if (e.target === fileInput) return;
    e.stopPropagation();
    fileInput.click();
  });
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  });
}

// ===== Remove file =====
if (fileRemove) {
  fileRemove.addEventListener('click', () => {
    resetConverter();
  });
}

// ===== Start conversion =====
async function startConversion() {
  if (!currentTool || selectedFiles.length === 0) return;
  const tool = TOOLS[currentTool];

  // Build FormData
  const formData = new FormData();

  if (tool.multiple) {
    selectedFiles.forEach(f => formData.append(tool.fieldName, f));
  } else {
    formData.append(tool.fieldName, selectedFiles[0]);
  }

  // Add page range for split
  if (tool.hasPageRange) {
    const pageRange = document.getElementById('pageRange').value.trim();
    if (!pageRange) {
      showError('Please enter page ranges (e.g. 1-3, 5, 7-9)');
      return;
    }
    formData.append('pages', pageRange);
  }

  // Add password for protect-pdf
  if (currentTool === 'protect-pdf') {
    const password = document.getElementById('userPassword')?.value;
    if (!password) {
      showError('Please enter a secure password to protect the document.');
      return;
    }
    formData.append('password', password);
  }

  // Add watermark text
  if (currentTool === 'add-watermark') {
    const watermarkText = document.getElementById('watermarkText')?.value;
    if (!watermarkText) {
      showError('Please enter a watermark text to protect your document.');
      return;
    }
    formData.append('watermark', watermarkText);
  }

  // UI: show progress
  convertBtn.style.display = 'none';
  filePreview.style.display = 'none';
  extraInput.style.display = 'none';
  progressSection.style.display = '';
  progressFill.style.width = '10%';
  progressText.textContent = 'Uploading file...';

  try {
    // Simulate progress
    let progress = 10;
    const progressInterval = setInterval(() => {
      if (progress < 85) {
        progress += Math.random() * 8;
        progressFill.style.width = Math.min(progress, 85) + '%';
      }
      if (progress > 30) progressText.textContent = 'Converting...';
      if (progress > 60) progressText.textContent = 'Almost done...';
    }, 400);

    const response = await fetch(tool.endpoint, {
      method: 'POST',
      body: formData
    });

    clearInterval(progressInterval);

    if (!response.ok) {
      let errMsg = 'Conversion failed';
      const text = await response.text();
      try {
        const errData = JSON.parse(text);
        errMsg = errData.error || errMsg;
      } catch (e) {
        console.error('Server error response:', text.substring(0, 200));
        errMsg = `Server error (${response.status}). Please check API health.`;
      }
      throw new Error(errMsg);
    }

    progressFill.style.width = '100%';
    progressText.textContent = 'Complete!';

    // Get the blob and build a proper download name from the original file
    const blob = await response.blob();
    downloadUrl = URL.createObjectURL(blob);

    // Build a human-readable filename from the original file name
    const baseName = originalFileName ? originalFileName.replace(/\.[^.]+$/, '') : 'converted';
    
    // For pdf-to-jpg, check the actual file type from response header or content-type
    let extension;
    if (currentTool === 'pdf-to-jpg') {
      const fileType = response.headers.get('X-File-Type');
      const contentType = response.headers.get('Content-Type') || blob.type;
      // Detect JPG vs ZIP from headers or content type
      if (fileType === 'jpg' || contentType.includes('image/jpeg')) {
        extension = '.jpg';
      } else {
        extension = '_images.zip';
      }
    } else {
      const extMap = {
        'pdf-to-docx': '.docx',
        'docx-to-pdf': '.pdf',
        'jpg-to-pdf': '.pdf',
        'merge-pdf': '.pdf',
        'split-pdf': '.pdf',
        'compress-pdf': '.pdf',
        'compress-image': '.jpg',
        'protect-pdf': '_protected.pdf',
        'json-to-csv': '.csv'
      };
      extension = extMap[currentTool] || '';
    }
    downloadName = baseName + extension;

    // Show success after a small delay
    setTimeout(() => {
      progressSection.style.display = 'none';
      successSection.style.display = '';
    }, 500);

  } catch (error) {
    progressSection.style.display = 'none';
    showError(error.message || 'Something went wrong. Please try again.');
  }
}

// ===== Download =====
if (downloadBtn) {
  downloadBtn.addEventListener('click', () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = downloadName || 'converted_file';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}

// ===== Show error =====
function showError(msg) {
  errorMessage.textContent = msg;
  errorSection.style.display = '';
  
  if (selectedFiles && selectedFiles.length > 0) {
    // If files are selected, allow trying again
    convertBtn.style.display = '';
    filePreview.style.display = '';
    extraInput.style.display = currentTool && (TOOLS[currentTool]?.hasPageRange || TOOLS[currentTool]?.hasExtraInput) ? 'block' : 'none';
  } else {
    convertBtn.style.display = 'none';
    filePreview.style.display = 'none';
    extraInput.style.display = currentTool && (TOOLS[currentTool]?.hasPageRange || TOOLS[currentTool]?.hasExtraInput) ? 'block' : 'none';
  }
}




// ===== Smooth scroll for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
