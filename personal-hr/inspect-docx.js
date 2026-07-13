const fs = require('fs');
const PizZip = require('pizzip');

try {
  const content = fs.readFileSync('public/templates/contract-template.docx', 'binary');
  const zip = new PizZip(content);
  const xml = zip.file("word/document.xml").asText();
  
  // Strip XML tags to get raw text
  const text = xml.replace(/<[^>]+>/g, '');
  
  // Find all text within square brackets
  const matches = text.match(/\[(.*?)\]/g) || [];
  
  // Deduplicate
  const uniqueTags = [...new Set(matches)];
  console.log(JSON.stringify(uniqueTags, null, 2));
} catch (e) {
  console.error(e);
}
