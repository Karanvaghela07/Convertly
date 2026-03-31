const fs = require('fs');
const filePath = 'public/json-to-csv.html';
let c = fs.readFileSync(filePath, 'utf8');

c = c.replace(/JSON to JSON/g, 'JSON to CSV');
c = c.replace(/JSON to Excel/g, 'JSON to CSV');
c = c.replace(/JSON-to-excel\.html/g, 'json-to-csv.html');
c = c.replace(/excel-to-JSON\.html/g, 'excel-to-csv.html');
c = c.replace(/to XLS\/XLSX/g, 'to CSV');
c = c.replace(/Excel spreadsheets/g, 'CSV spreadsheets');
c = c.replace(/JSON \(Comma-Separated Values\)/g, 'JSON (JavaScript Object Notation)');
c = c.replace(/CSV \(Comma-Separated Values\)/g, 'JSON (JavaScript Object Notation)'); // if any

fs.writeFileSync(filePath, c, 'utf8');