const axios = require('axios');
const fs = require('fs');

// Asana API credentials
const clientId = '1205658281647042';
const clientSecret = 'd3d61ff963ac478f9e60362faed780b9';
const redirectUri = 'https://app.asana.com/0/1205656322341580/1205656296352040'; // Redirect URI you set in your Asana app

// OAuth2 authorization URL
const authUrl = `https://app.asana.com/-/oauth_authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;

// Exchange code for an access token
async function getAccessToken(code) {
  const tokenResponse = await axios.post(
    'https://app.asana.com/-/oauth_token',
    `client_id=${clientId}&client_secret=${clientSecret}&code=${code}&grant_type=authorization_code&redirect_uri=${encodeURIComponent(redirectUri)}`,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  return tokenResponse.data.access_token;
}

// Fetch defects from Asana project
async function fetchDefects(accessToken) {
  try {
    const response = await axios.get('https://app.asana.com/api/1.0/projects/PROJECT_ID/tasks', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching defects:', error.message);
    return [];
  }
}

// Save defects to a .txt file
function saveDefectsToFile(defects) {
  const defectList = defects.map(defect => defect.name).join('\n');  6
  fs.writeFileSync('Asana_defects.txt', defectList);
}

async function main() {
  // Prompt the user to authorize the app in a web browser and get the code
  console.log(`Authorize the app by visiting: ${authUrl}`);
  const code = '1/1205656261703097:34a3a7ef899c3248510e5c54d368ac8f';
   // Replace with the code obtained after authorization

  // Exchange the code for an access token
  const accessToken = await getAccessToken(code);

  // Fetch defects from Asana project
  const defects = await fetchDefects(accessToken);

  // Save defects to a .txt file
  saveDefectsToFile(defects);

  console.log('Defects saved to Asana_defects.txt');
}

main();
