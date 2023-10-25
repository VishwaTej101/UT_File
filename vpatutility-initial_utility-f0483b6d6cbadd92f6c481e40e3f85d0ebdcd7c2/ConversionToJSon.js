import XLSX from 'xlsx';
import fs from 'fs';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });

let filePath = await rl.question("Provide complete File Path: ");

// Read the Excel file
const workbook = XLSX.readFile(filePath);

// Choose the sheet you want to read
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert the worksheet to a JSON object
const jsonData = XLSX.utils.sheet_to_json(worksheet);

// Print the JSON data
//console.log(jsonData);

// If you want to write the JSON data to a file
const outputFilePath = 'C:/Users/sgupta/Documents/Utility/output.json';
fs.writeFileSync(outputFilePath, JSON.stringify(jsonData, null, 2));
console.log(`JSON data written to ${outputFilePath}`);