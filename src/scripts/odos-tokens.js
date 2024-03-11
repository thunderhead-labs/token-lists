//const fetch = 'node-fetch'
import fs from 'fs'
import path, {dirname} from 'path'

// URL to fetch data from
const DATA_URL = 'https://api.odos.xyz/info/tokens/1';

// Path to save the formatted data
const SAVE_PATH = './src/public/Odos.json'

// Utility function to format the fetched data
// Utility function to format the fetched data according to the new structure
function formatData(data) {
    // Transform the data map into the desired array format
    const tokens = Object.entries(data).map(([address, tokenDetails]) => ({
      address: address,
      name: tokenDetails.name,
      symbol: tokenDetails.symbol,
      decimals: tokenDetails.decimals,
      chainId: 1,
      logoURI: `https://raw.githubusercontent.com/thunderhead-labs/token-lists/main/src/public/images/1/${address}/logo.png`,
      assetId: tokenDetails.assetId,
      assetType: tokenDetails.assetType,
      protocolId: tokenDetails.protocolId,
      isRebasing: tokenDetails.isRebasing
    }));
  
    return {
      name: "Odos Token List",
      timestamp: new Date().toISOString(),
      version: {
        major: 1,
        minor: 0,
        patch: 0
      },
      keywords: ["custom", "token", "list"],
      tokens: tokens
    };
  }
  

// Function to fetch data and process it
async function fetchDataAndProcess(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Data fetched successfully:", data.tokenMap, "tokens");
    const formattedData = formatData(data.tokenMap); // Assuming the tokens are in a property called 'tokens'
    fs.writeFileSync(SAVE_PATH, JSON.stringify(formattedData, null, 2), 'utf8');
    console.log(`Data has been formatted and saved to ${SAVE_PATH}`);
  } catch (error) {
    console.error("Error fetching or processing data:", error);
  }
}

// Execute the function
fetchDataAndProcess(DATA_URL);
