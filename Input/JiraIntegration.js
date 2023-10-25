const fetch = require('node-fetch');
const fs = require('fs');

require('dotenv').config(); // Load environment variables from .env file

const jiraEmail = "viswateja030@gmail.com";
const jiraApiToken = "ATCTT3xFfGN0gQR1dtHxHJVgTnvqt74VeDFF6X9j-4e9uHKR52nvzJfHBbSdf0RkHG7o59ISIwH4qL3fXr83J7FEvTnAAui1mFVnlXVKP6YuCPqpybGN3JbakUFtoOBHk-h6NW0257ghmwN8kq9OorkSrDa5hzK6wTiufuqal0TCJAKXifvQF7Q=585BEF4C"
const apiUrl = 'https://datavaluetest.atlassian.net/rest/api/3/search';
const outputFilePath = 'JsonInt.json';

const headers = {
  'Authorization': `Basic ${Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64')}`,
  'Accept': 'application/json',
};

fetch(apiUrl, {
  method: 'GET',
  headers: headers,
})
  .then(response => {
    console.log(`Response: ${response.status} ${response.statusText}`);
    return response.json(); // Parse the response as JSON
  })
  .then(jsonData => {
    // Write JSON data to a file
    fs.writeFileSync(outputFilePath, JSON.stringify(jsonData, null, 2));
    console.log(`Data saved to ${outputFilePath}`);
  })
  .catch(err => console.error(err));
