// Script to upload team icons
const fs = require('fs');
const https = require('https');
const http = require('http');

// Team ID to icon file mapping
const teamIcons = {
  1: 'dragon.b64',     // Royal Blue Dragons
  2: 'ninja.b64',      // Ninja Turquoise
  3: 'python.b64',     // Green Pythons
  4: 'hornets.b64',    // Yellow Hornets
  5: 'jaguar.b64',     // Orange Jaguars
  6: 'bull.b64',       // Red Bulls
  7: 'wasps.b64',      // Purple Wasps
  8: 'panther.b64',    // Pink Panthers
  9: 'falcon.b64',     // White Falcons
  10: 'stallion.b64',  // Gray Stallions
  11: 'wolves.b64',    // Brown Wolves
  12: 'tiger.b64'      // Maroon Tigers
};

// Simple function to upload an icon using the native http module
function uploadIcon(teamId, iconFile) {
  return new Promise((resolve, reject) => {
    try {
      // Read the base64 file
      const base64Icon = fs.readFileSync(iconFile, 'utf8');
      
      // Prepare the request data
      const data = JSON.stringify({
        icon: `data:image/png;base64,${base64Icon}`
      });
      
      console.log(`Uploading icon for team ${teamId}...`);
      
      // Configure the request options
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: `/api/teams/${teamId}/icon`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };
      
      // Make the HTTP request
      const req = http.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`Team ${teamId} icon updated successfully!`);
            resolve();
          } else {
            console.error(`Failed to update icon for team ${teamId}: ${res.statusCode}`);
            reject(new Error(`HTTP Error: ${res.statusCode}`));
          }
        });
      });
      
      req.on('error', (error) => {
        console.error(`Request error for team ${teamId}:`, error.message);
        reject(error);
      });
      
      // Send the request data
      req.write(data);
      req.end();
    } catch (error) {
      console.error(`Error processing team ${teamId}:`, error.message);
      reject(error);
    }
  });
}

// Process icons sequentially
async function processIcons() {
  for (const [teamId, iconFile] of Object.entries(teamIcons)) {
    try {
      await uploadIcon(teamId, iconFile);
      // Wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error with team ${teamId}:`, error.message);
    }
  }
  console.log('Icon upload process complete!');
}

// Start the upload process
processIcons();