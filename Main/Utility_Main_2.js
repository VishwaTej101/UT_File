const { OpenAIApi, Configuration } = require('openai');
const fs = require('fs');
const HTMLtoDOCX = require('html-to-docx');

const apiKey = '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';
const configuration = new Configuration({ apiKey });
const openai = new OpenAIApi(configuration);

let jsondata;
let apiResponse = '';
let HTMLContent;
const filePath = 'Output\\defect_report.txt';
const maxTokensPerRequest = 4096; // Adjust as needed

// Call your Jira integration and create the defect report

// ...

setTimeout(() => {
    fs.readFile(filePath, 'utf8', (importError, importData) => {
        if (importError) {
            console.error(`Error reading ${filePath}:`, importError);
            return;
        }
        jsondata = importData;
        // Continue with your code that uses the file's content here
    });
}, 1500);

fs.readFile('Output\\Checkpoints_List.txt', 'utf8', async (checkpointerror, checkpoints_data) => {
    if (checkpointerror) {
        console.error('Error reading Checkpoints_List.txt error', checkpointerror);
        return;
    }

    const checkpointData = checkpoints_data;

    // Function to convert HTML output to DOCX
    async function ConvertToDocx(htmlInput) {
        const finalfilePath = './Final_VPAT.docx';
        const fileBuffer = await HTMLtoDOCX(htmlInput, null, {
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

    function startProcessing(userMessage) {
        // Start the processing from the beginning
        doRequest(userMessage);
    }

    async function doRequest(userMessage, startToken = 0) {
        try {
            // Calculate the end token based on the maximum tokens per request
            let endToken = startToken + maxTokensPerRequest;

            if (endToken > jsondata.length) {
                endToken = jsondata.length;
            }

            const jsonChunk = jsondata.substring(startToken, endToken);

            const response = await openai.createChatCompletion({
                model: 'gpt-3.5-turbo-16k',
                messages: [
                    {
                        role: 'system',
                        content: `
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
                    { role: 'user', content: jsonChunk },
                ],
                temperature: 1,
                max_tokens: maxTokensPerRequest,
            });

            const responseContent = response.data.choices[0]?.message?.content || '';

            apiResponse += responseContent;

            // If there are more tokens to process, make a recursive call with a delay
            if (endToken < jsondata.length) {
                setTimeout(() => {
                    doRequest(userMessage, endToken);
                }, 1000); // Delay for 1 second between requests
            } else {
                // All processing is complete
                ConvertToDocx(apiResponse);
            }
        } catch (apiError) {
            console.error(`Error calling the OpenAI API: ${apiError.message}`);
            throw apiError;
        }
    }

    const userMessage = 'Create a complete VPAT report in doc format';
    // Call the startProcessing function to fetch data from the API
    startProcessing(userMessage);
});
