const fetch = require('node-fetch'); // Ensure this is at the top
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

async function downloadPDF(url, downloadPath) {
  const response = await fetch(url);
  const buffer = await response.buffer();
  fs.writeFileSync(downloadPath, buffer);
}

async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

(async () => {
  const pdfUrl = 'https://content.vexrobotics.com/docs/2024-2025/viqrc-rapid-relay/RapidRelay-3.0.pdf';
  const downloadPath = path.join(__dirname, 'downloaded.pdf');

  await downloadPDF(pdfUrl, downloadPath);
  const text = await extractTextFromPDF(downloadPath);

  console.log(text);
})();