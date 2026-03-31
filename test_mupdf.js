const fs = require('fs');

async function test() {
  try {
    const mupdf = await import('mupdf');
    console.log("Keys:", Object.keys(mupdf));
    if (mupdf.Document) {
      console.log("Document exists");
    }
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
