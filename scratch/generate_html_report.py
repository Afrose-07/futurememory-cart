import os
import re

md_path = os.path.join(os.path.dirname(__file__), '..', 'FutureMemory_Cart_Project_Report.md')
with open(md_path, 'r', encoding='utf-8') as f:
    text = f.read()

html_head = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>FutureMemory Cart - Project Report</title>
<style>
  @page {
    size: A4;
    margin: 20mm 20mm 20mm 20mm;
  }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    line-height: 1.6;
    color: #111;
    margin: 0;
    padding: 40px;
    background: #fff;
    max-width: 900px;
    margin: 0 auto;
  }
  h1 {
    font-size: 17pt;
    text-align: center;
    margin-top: 25px;
    margin-bottom: 20px;
    text-transform: uppercase;
    font-weight: bold;
  }
  h2 {
    font-size: 13.5pt;
    margin-top: 25px;
    margin-bottom: 12px;
    font-weight: bold;
    border-bottom: 1px solid #ddd;
    padding-bottom: 4px;
  }
  h3 {
    font-size: 12pt;
    margin-top: 15px;
    margin-bottom: 8px;
    font-weight: bold;
  }
  p {
    text-align: justify;
    margin-bottom: 12px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0 25px 0;
    font-size: 10.5pt;
  }
  th, td {
    border: 1px solid #333;
    padding: 6px 10px;
    text-align: left;
  }
  th {
    background-color: #f2f2f2;
    font-weight: bold;
  }
  pre {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    padding: 12px;
    font-size: 9pt;
    font-family: Consolas, monospace;
    overflow-x: auto;
  }
  ul, ol {
    margin-bottom: 12px;
  }
  li {
    margin-bottom: 4px;
  }
  hr {
    border: 0;
    border-top: 1px solid #ccc;
    margin: 25px 0;
  }
  .print-btn {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #2563eb;
    color: white;
    padding: 10px 18px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  }
  @media print {
    body { padding: 0; max-width: 100%; }
    .print-btn { display: none; }
  }
</style>
</head>
<body>
<button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
"""

lines = text.split('\n')
out = []
in_table = False
in_pre = False

for line in lines:
    s = line.strip()
    if s.startswith('```'):
        if in_pre:
            out.append('</pre>')
            in_pre = False
        else:
            out.append('<pre>')
            in_pre = True
        continue

    if in_pre:
        out.append(line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'))
        continue

    if s.startswith('|'):
        if not in_table:
            out.append('<table>')
            in_table = True
        cols = [c.strip() for c in s.split('|')[1:-1]]
        if all(set(c) <= set('-: ') for c in cols if c):
            continue
        is_header = len(out) > 0 and out[-1] == '<table>'
        tag = 'th' if is_header else 'td'
        row = '<tr>' + ''.join(f'<{tag}>{c}</{tag}>' for c in cols) + '</tr>'
        out.append(row)
        continue
    elif in_table:
        out.append('</table>')
        in_table = False

    if '<div style="page-break-after: always;"></div>' in line:
        out.append('<div style="page-break-after: always;"></div>')
        continue

    if s.startswith('# '):
        out.append(f'<h1>{s[2:].strip()}</h1>')
    elif s.startswith('## '):
        out.append(f'<h2>{s[3:].strip()}</h2>')
    elif s.startswith('### '):
        out.append(f'<h3>{s[4:].strip()}</h3>')
    elif s.startswith('- ') or s.startswith('* '):
        out.append(f'<li>{s[2:].strip()}</li>')
    elif s == '---':
        out.append('<hr>')
    elif s:
        text_line = s
        text_line = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text_line)
        text_line = re.sub(r'\*(.*?)\*', r'<em>\1</em>', text_line)
        out.append(f'<p>{text_line}</p>')

if in_table:
    out.append('</table>')
if in_pre:
    out.append('</pre>')

full_html = html_head + '\n'.join(out) + '</body></html>'

desktop = os.path.join(os.environ['USERPROFILE'], 'Desktop')
dst = os.path.join(desktop, 'FutureMemory_Cart_Project_Report.html')
with open(dst, 'w', encoding='utf-8') as out_f:
    out_f.write(full_html)

# Also save locally
local_html = os.path.join(os.path.dirname(__file__), '..', 'FutureMemory_Cart_Project_Report.html')
with open(local_html, 'w', encoding='utf-8') as out_f:
    out_f.write(full_html)

print(f"Report generated successfully!")
print(f"Desktop: {dst}")
print(f"Local: {local_html}")
