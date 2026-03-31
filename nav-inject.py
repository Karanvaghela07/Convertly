import re

with open('public/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# For Organize PDF
content = content.replace(
    '<a href="/compress-pdf.html">Compress PDF</a>',
    '<a href="/compress-pdf.html">Compress PDF</a>\\n            <a href="/protect-pdf.html">Protect PDF <span style="font-size:0.6rem; background:#E5322D; color:#fff; padding:2px 6px; border-radius:10px; margin-left:4px;">NEW</span></a>'
)

# For Excel Tools (since we converted JSON to CSV, we can put it there or under a new dropdown, but let's just add it to Excel Tools)
content = content.replace(
    '<a href="/excel-to-csv.html">Excel to CSV</a>',
    '<a href="/excel-to-csv.html">Excel to CSV</a>\\n            <a href="/json-to-csv.html">JSON to CSV <span style="font-size:0.6rem; background:#E5322D; color:#fff; padding:2px 6px; border-radius:10px; margin-left:4px;">NEW</span></a>'
)

with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Nav Injected!")
