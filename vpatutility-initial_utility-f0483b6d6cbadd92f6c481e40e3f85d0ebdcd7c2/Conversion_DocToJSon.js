import XLSX from 'xlsx';
import fs from 'fs';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import mammoth from 'mammoth';

//json to docx
import Docxtemplater from 'docxtemplater';
import pizzip from 'pizzip'
const zip = new pizzip();

//import js2xmlparser from 'js2xmlparser';

const rl = readline.createInterface({ input, output });

//let filePath = await rl.question("Provide complete File Path for doc file: ");
let docxFilePath = 'D:/Castle/TestFiles/vpat.docx';

// Output JSON file path
const jsonFilePath = "D:/output.json";

// Convert .docx to HTML
mammoth.extractRawText({ path: docxFilePath })
  .then((result) => {
    // Parse the extracted HTML into JSON or any other desired format
    const extractedText = result.value;
    
    // You can customize the JSON structure based on your needs
    const jsonData = {
      content: extractedText,
    };

    // Write the JSON data to a file
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));
    console.log(`File converted to JSON and saved at ${jsonFilePath}`);
  })
  .catch((err) => {
    console.error("Error converting .docx to JSON:", err);
  });

// code to convert above json to docx
// Your JSON data
const content = fs.readFileSync(docxFilePath, 'binary');
zip.load(content);
const docx = new Docxtemplater().loadZip(zip);

//docx.load(content);

// JSON data to be injected into the template
// const jsonData = {
//   title: 'Sample Document',
//   content: 'This is a sample document generated from JSON data.',
//   date: '2023-09-06',
// };

// Bind the JSON data to the template
docx.setData(jsonData);

// Render the document
try {
  docx.render();
} catch (error) {
  console.error('Error rendering document:', error);
}

// Save the generated Word document
const outputPath = 'D:/output.docx';
const buffer = docx.getZip().generate({ type: 'nodebuffer' });
fs.writeFileSync(outputPath, buffer);

console.log(`Word document saved to: ${outputPath}`);