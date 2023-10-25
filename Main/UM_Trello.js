const { OpenAIApi, Configuration } = require('openai');
// const pLimit = require('p-limit')
const PDFDocument = require('pdfkit');
const fs = require('fs');
const HTMLtoDOCX = require('html-to-docx');


// console.log("Before API");

const apiKey = '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'
const configuration = new Configuration({ apiKey })

const openai = new OpenAIApi(configuration);
let jsondata;
// let textdata;
let apiResponse;
let HTMLContent;
let filePath = 'card_info.txt';

// console.log("Before JiraIntegration");

//calling the Filter File.js - jira output data

// var jira_Integration  = require("../Input/Jira_Integration");

// jira_Integration.jira_Int();

// var trello_Integration = require("../Input/Trello_Integration");

// console.log("Before reading the jira defect report");

//reading the jira output file from defect_report.txt

// let wdata;
//here we need to add the wait as the defect_report.txt takes time be created of approx 5 sec
// setTimeout(5000);


// fs.readFile('Trello_Output\\card_info.txt', 'utf8', async (importError, importData) => {
//     if (importError) {
//         console.error('Error reading defect_report2.jsonl:', importError);
//         return;
//     }

// here the wait of 5 seconds is added
setTimeout(() => {
    
    // Read the file after waiting for 5 seconds
    fs.readFile(filePath, 'utf8', (importError, importData) => {
        if (importError) {
            console.error(`Error reading ${filePath}:`, importError);
            return;
        }
        jsondata = importData;
        // Continue with your code that uses the file's content here
        // console.log(`File content: ${importData}`);
    });
}, 1500);
// jsondata = importData;
    // fs.readFile('Input\SampleOutput_template.txt', 'utf8', async (txtError, txtData) => {
    //     if (txtError) {
    //         console.error('Error reding sample txt document:', txtError);
    //         return;
    //     }
    //     const sample_tempalte = txtData;

        fs.readFile('Output\\Checkpoints_List.txt', 'utf8', async (checkpointerror, checkpoints_data) => {
            if (checkpointerror) {
                console.error('Error reading Checkpoints_List.txt error', checkpointerror);
                return;
            }

            const checkpointData = checkpoints_data;


            // console.log("Before prompt data");

            // textdata = txtData;
            // const combinedData = `JSON Data:\n${jsondata}\n\nText Data:\n${txtData}`;
            async function doRequest() {
                try {
                    // Replace this with your actual code to call the OpenAI API and return content
                    const response = await openai.createChatCompletion({
                        model: 'gpt-3.5-turbo-16k',
                        messages: [
                            {
                                role: 'system', content: `
                                You are an expert in VPAT reports. Your task is to provide me VPAT document with 
                                                            'Supported Status' and 'Remarks' by taking defects from 'jsondata' file as given.
                                                            
                                                            Also, include all the other information above and below the table that is displayed in VPAT document like "Introduction', 'Version', 'Contact Information', 'Recommendations', 'Conclusion' and 'Legal Disclaimer <Company>' etc.
                                                            Also sort out all the 95 checkpoints from "${checkpointData}" in ascending order starting from '1.1.1 Non-text Content' to '4.1.3 Status Messages' as per the WCAG 2.1 checkpoints 
                                                            
                                                            Important: All defects from 'jsondata' file must be present in 'Remarks' section of table corresponding to each checkpoint like '1.4.4 Resize text' and 'Focus Visible( 2.4.7)'.
                                                            
                                                            Total number of defects in 'jsondata' file should be same as the total number of defects present in final output file.
                                                            Tabular form must contain all the WCAG 2.1 Checkpoints like from '1.1.1 Non-text Content' to '4.1.3 Status Messages'
                                                            Tabular form must contain "1.4.12 Text Spacing" checkpoint like other WCAG 2.1 checkpoints having 'supported status' and 'remarks' in the output file
                                                            
                                                            Important: Also keep the Remarks section blank if no defect is present corresponding to that checkpoint
                                                            
                                                            Mark the checkpoint's 'Support Status' as 'Supported' if no defect is present corresponding to that checkpoint in 'jsondata' file
                                                            Mark the checkpoint's 'Support Status' as 'Does Not Support' if any defect is present corresponding to that checkpoint in 'jsondata' file  having "Priority" either 'High' or 'Critical'
                                                            Mark the checkpoint's 'Support Status' as 'Partially Supported' if any defect is present corresponding to that checkpoint in 'jsondata' file having "Priority" either 'Low' or 'Medium'
                                                           
                                                            Return the output in table format in form of HTML file
                            `
                            },
                            { role: 'user', content: jsondata },
                        ],
                        temperature: 1, // You can adjust this value for different responses
                        max_tokens: 4096,
                    });
                    apiResponse = response.data.choices[0]?.message?.content || '';

                    // console.log("Before writing the file in .html");

                    // generate_text(apiResponse);
                    // Assuming apiResponse is the content you want to save
                    // Write the API response to a file
                    // const filePath = 'VPAT_Document_5.html';
                    // fs.writeFile(filePath, apiResponse, 'utf8', (error) => {
                    //     if (error) {
                    //         console.error('Error writing to the file:', error);
                    //     } else {
                    //         console.log(`API response has been written to ${filePath}`);
                    //     }
                    // });
                    return apiResponse;

                } catch (apiError) {
                    currentRetry++;
                    if (currentRetry < maxRetries) {
                        console.error(`Error calling the OpenAI API (Retry ${currentRetry}): ${apiError.message}`);
                        const delay = initialDelayMs * Math.pow(2, currentRetry - 1);
                        console.log(`Retrying in ${delay / 1000} seconds...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        return doRequest(); // Retry the request
                    } else {
                        throw new Error(`Exceeded maximum retries (${maxRetries}) for calling the OpenAI API.`);
                    }
                }

            }

            //////code for output pdf file////////////////
            // console.log("Before PDF file function");
            // read the content of text output
            // const textFilePath = 'VPAT_Document_3.txt';
            // const textContent = fs.readFileSync(textFilePath, 'utf-8');

            // //Create a writable stream to generate the pdf
            // const pdfFilePath = 'VPAT_Document_3.pdf'
            // const pdfStream = fs.createWriteStream(pdfFilePath);

            // //Create a new PDF document
            // const doc = new PDFDocument();

            // doc.pipe(pdfStream);

            // doc.fontSize(12).text(textContent, {
            //     align: 'left',
            //     lineGap: 5,
            //     width: 500,
            // });

            // doc.end();

            // pdfStream.on('finish', () => {
            //     console.log('PDF file has been generated');
            // });


            // Assuming userMessage is defined somewhere before calling doRequest
            const userMessage = 'Repeated 5 times'; // Replace with your user message
            const maxRetries = 5; // Specify the maximum number of retries
            const initialDelayMs = 1000; // Specify the initial delay in milliseconds
            let currentRetry = 0; // Initialize the current retry count
            // Call the doRequest function to fetch data from the API and save it to a file
            // doRequest(userMessage, maxRetries, initialDelayMs, currentRetry);

            // Call the doRequest function to fetch data from the API and save it to a file
            HTMLContent = await doRequest(userMessage, maxRetries, initialDelayMs, currentRetry);
            ConvertToDocx(HTMLContent);
        });
    // });
    //Function to convert HTML output to Docx
    async function ConvertToDocx(htmlInput) {
        const HTMLContent = htmlInput;
        //console.log(HTMLContent);
        const finalfilePath = 'Output\\Final_VPAT.docx';
        const fileBuffer = await HTMLtoDOCX(HTMLContent, null, {
            table: { row: { cantSplit: true } },
            footer: true,
            pageNumber: true,
        });
        
        fs.writeFile(finalfilePath, fileBuffer, (error) => {
            if (error) {
                console.log('VPAT document creation failed');
                return;
            }
            console.log('VPAT Document created successfully: Final_VPAT.docx');
        });
    }

// });