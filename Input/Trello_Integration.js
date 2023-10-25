var trello_Int = function trello_Int(){
const fetch = require('node-fetch');
const fs = require('fs');

const apiKey = '6cc05daf988ee4dfb6ca5cf2a85e2adc';
const accessToken = 'ATTAbcdfebf3676e21ea6080b022c84e7b39a10a2416588ab79f4d98b9704c3a7486E028486F';
const boardId = 'Qx8oj8x9';

// Make a GET request to retrieve all cards on the board
const apiUrl = `https://api.trello.com/1/boards/${boardId}/cards?key=${apiKey}&token=${accessToken}`;

fetch(apiUrl)
  .then(response => response.json())
  .then(cards => {
    const cardInfo = cards.map(card => {
      // Get the card's labels
      const labels = card.labels.map(label => label.name).join(', ');

      return {
        name: card.name,
        description: card.desc,
        labels: labels
      };
    });

    const filePath = 'card_info.txt';
    const fileContent = cardInfo.map(card => {
      return `Description: ${card.description}\nPriority: ${card.labels}\n`;
    }).join('\n');

    fs.writeFile(filePath, fileContent, 'utf-8', (error) => {
      if (error) {
        console.error('Error writing to file:', error);
      } else {
        console.log(`Data has been written to ${filePath}`);
      }
    });
  })
  .catch(error => console.error('Error:', error));
}

module.exports. trello_Int =  trello_Int;