import XLSX from 'xlsx';
import fs from 'fs';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {OpenAIApi, Configuration} from "openai";

//json to docx
import Docxtemplater from 'docxtemplater';
import pizzip from 'pizzip'
const zip = new pizzip();

const rl = readline.createInterface({ input, output });

let filePath = await rl.question("Provide complete File Path: ");

// Read the Excel file
const workbook = XLSX.readFile(filePath);

// Choose the sheet you want to read
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert the worksheet to a JSON object
const jsonData = XLSX.utils.sheet_to_json(worksheet);

const apiKey = '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'; // Replace this with your actual OpenAI API key

const configuration = new Configuration({ apiKey });
const openai = new OpenAIApi(configuration);

const defectsList = JSON.stringify(jsonData, null, 2);
const jsonFilePath = "D:/SampleVPAT.json";
const messages = [
    { role: 'system', content: 'You are an expert in updating VPAT document based on defects provided' },
    { role: 'user', content: `Update the VPAT document given in JSON format ${jsonFilePath} based on accessibility defects ${defectsList} and follow below instructions:
    \n - Get the defect details based on WCAG checkpoint from ${defectsList}
    \n - Find the corresponding checkpoint in ${jsonFilePath}
    \n - Update the 'Remarks' section in above step with Name of defect 
    \n - Do not add duplicate checkpoints instead add all defects of same checkpoint in 'Remarks' sections of corresponding checkpoint
    \n - do not include 'Defect ID' and 'Is exception' fields` }
    //{ role: 'user', content: `Provide VPAT document with supported status and remarks in JSON based on opened defects in ${defectsList}` }
];

// const messages = [
//     { role: 'system', content: 'You are an expert in finding latest VPAT template' },
//     { role: 'user', content: `Provide VPAT document as per WCAG standards in tabular format in JSON based on accessibility defects ${defectsList} and follow below instructions:
//     \n - ignore defect id
//     \n - include status for checkpoints in VPAT as Supported/ Does not Support/ Partally Support` }
//     //{ role: 'user', content: `Provide VPAT document with supported status and remarks in JSON based on opened defects in ${defectsList}` }
// ];

console.log(`Starting VPAT doc: `);
let jsonDataForDocx = "";
(async () => {
    try {
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo-16k",
            messages: messages,
            temperature: 1,
            max_tokens: 1500
        });

        const output = response.data.choices[0].message.content;
        jsonDataForDocx =output;
        console.log("OpenAI Response:", output);
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
})();

// let docxFilePath = 'D:/Castle/TestFiles/vpat.docx';
// console.log("OpenAI Response:", jsonDataForDocx);
// // code to convert above json to docx
// (async () => {
// const content = fs.readFileSync(docxFilePath, 'binary');
// zip.load(content);
// const docx = new Docxtemplater().loadZip(zip);

// // Bind the JSON data to the template
// docx.setData(jsonDataForDocx);

// // Render the document
// try {
//   docx.render();
// } catch (error) {
//   console.error('Error rendering document:', error);
// }

// // Save the generated Word document
// const outputPath = 'D:/output.docx';
// const buffer = docx.getZip().generate({ type: 'nodebuffer' });
// fs.writeFileSync(outputPath, buffer);

// console.log(`Word document saved to: ${outputPath}`);
// })()
