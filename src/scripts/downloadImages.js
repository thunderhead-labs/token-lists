import OdosList from '../public/Odos.json' assert { type: "json" }
import fetch from 'node-fetch';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const cowprotocolImgUrl = (chainId, address) => 'https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/images/'+chainId+'/'+address+'/logo.png';
const trustwalletImgUrl = (chainId, address) => 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/'+address+'/logo.png';

function findTokenLogoUri(tokensList, chainId, symbol) {
  const token = tokensList.find(token => token.chainId === chainId && token.symbol.toUpperCase() === symbol.toUpperCase());
  return token ? token.logoURI : null;
}

async function main() {
  const missingTokens = [];
  const imageSources = [
    cowprotocolImgUrl,
    trustwalletImgUrl
  ];

  // Fetch the entire list of tokens from CoinGecko at the start
  let coingeckoTokensList = [];
  try {
    const response = await fetch('https://tokens.coingecko.com/uniswap/all.json');
    if (!response.ok) throw new Error('Failed to fetch data from CoinGecko');
    const data = await response.json();
    coingeckoTokensList = data.tokens;
  } catch (error) {
    console.error('Error fetching token list from CoinGecko:', error);
  }
  
  for (const token of OdosList.tokens) {
    const { symbol, name, address, chainId } = token;
    const filePath = path.join('../public/images', chainId.toString(), address, 'logo.png');
    let imageFetched = false;

    // Attempt to find and download the logo from CoinGecko first
    const coingeckoLogoUri = findTokenLogoUri(coingeckoTokensList, chainId, symbol);
    if (coingeckoLogoUri) {
      imageSources.unshift(() => coingeckoLogoUri); // Prepend CoinGecko URI as a priority source
    }

    for (const source of imageSources) {
      let logoURI = typeof source === 'function' ? source(chainId, address) : source;
      if (!logoURI) continue;

      const response = await fetch(logoURI);
      if (response.ok) {
        const dirName = dirname(fileURLToPath(import.meta.url));
        const absolutePath = path.join(dirName, filePath);
        const directory = path.dirname(absolutePath);

        if (!existsSync(directory)) {
          mkdirSync(directory, { recursive: true });
        }

        const fileStream = createWriteStream(absolutePath);
        console.log(`Saving image for ${symbol} (${name})`);
        await new Promise((resolve, reject) => {
          response.body.pipe(fileStream);
          response.body.on('error', reject);
          fileStream.on('finish', resolve);
        });
        imageFetched = true;
        break; // Exit the loop if image is successfully fetched
      }
    }

    if (!imageFetched) {
      console.log(`Failed to fetch image for ${symbol} (${name}) from all sources, skipping.`);
      missingTokens.push(symbol);
    }
  }

  if (missingTokens.length > 0) {
    console.log('Tokens with missing or failed images:', missingTokens.join(', '));
  } else {
    console.log('All images fetched and saved successfully.');
  }
}

main().catch(console.error)