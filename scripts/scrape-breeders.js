import axios from 'axios';
import * as cheerio from 'cheerio';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function readStoreList() {
  try {
    const data = await fs.readFile('src/store-list.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading store-list.json:', error);
    return [];
  }
}

async function geocodeLocation(location, region, countryCode) {
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const maxRetries = 3;
  
  // Primary query formats using location details
  const queryFormats = [
    { q: `${location}, ${region}, ${countryCode}` },
    { q: `${location}, ${countryCode}` },
    { q: `${region}, ${countryCode}` }
  ];

  // Fallback format that uses only the country code
  const fallbackFormat = { q: `${countryCode}` };

  // Try primary query formats with retries
  for (let format of queryFormats) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await delay(1000);

        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: {
            ...format,
            format: 'json',
            limit: 1,
          },
          headers: {
            'User-Agent': 'GeckoCoBreederScraper/1.0'
          }
        });

        if (response.data && response.data.length > 0) {
          console.log(`Successful geocoding for ${location}, ${region}, ${countryCode} using format:`, format);
          return {
            lat: parseFloat(response.data[0].lat),
            lng: parseFloat(response.data[0].lon)
          };
        }

        console.warn(`Geocoding failed for ${location}, ${region}, ${countryCode} using format:`, format);
      } catch (error) {
        console.error(`Geocoding error for ${location}, ${region}, ${countryCode} using format:`, format, 
                      error.response ? error.response.data : error.message);
      }

      // Exponential backoff delay
      await delay(2000 * Math.pow(2, attempt));
    }
  }

  // Fallback to country-only geocoding
  console.warn(`Falling back to country-only geocoding for ${countryCode}`);
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        ...fallbackFormat,
        format: 'json',
        limit: 1,
      },
      headers: {
        'User-Agent': 'GeckoCoBreederScraper/1.0'
      }
    });

    if (response.data && response.data.length > 0) {
      console.log(`Country-only geocoding successful for ${countryCode}`);
      return {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon)
      };
    } else {
      console.warn(`Country-only geocoding failed for ${countryCode}`);
    }
  } catch (error) {
    console.error(`Geocoding error for country-only fallback ${countryCode}:`, 
                  error.response ? error.response.data : error.message);
  }

  console.error(`All geocoding attempts failed for location: ${location}, ${region}, ${countryCode}`);
  return null;
}


async function scrapeStoreInfo(storeName, breederName, region, countryCode) {
  try {
    const response = await axios.get(`https://www.morphmarket.com/stores/${storeName}/`);
    const $ = cheerio.load(response.data);
    
    const metaDescription = $('meta[name="description"]').attr('content');
    let location = 'Not found';
    const locationMatch = metaDescription.match(/located in (.+?)\./);
    if (locationMatch) {
      location = locationMatch[1].trim();
    }

    const logoUrl = $('.store-logo img').attr('src');
    const logo = logoUrl ? (logoUrl.startsWith('http') ? logoUrl : `https://www.morphmarket.com${logoUrl}`) : 'Not found';

    const species = new Set();
    $('.store-link-card').each((_, element) => {
      const speciesText = $(element).find('.font_bodyCopyBold').text().trim();
      const match = speciesText.match(/\d+\s+(.+)/);
      if (match) {
        const speciesName = match[1].replace(/s$/, '');
        species.add(speciesName);
      }
    });

    console.log(`Debug - ${storeName} species:`, Array.from(species));

    const markerPosition = await geocodeLocation(location, region, countryCode);
    if (!markerPosition) {
      console.warn(`Failed to create marker for ${storeName} at location: ${location}, ${region}, ${countryCode}`);
    }

    return { storeName, breederName, location, logo, species: Array.from(species), markerPosition, region, countryCode };
  } catch (error) {
    console.error(`Error scraping store ${storeName}:`, error.message);
    return { storeName, breederName, location: 'Not found', logo: 'Not found', species: [], markerPosition: null, region, countryCode };
  }
}

async function scrapeBreeders() {
  try {
    const storeList = await readStoreList();
    const breeders = [];

    console.log(`Total stores in JSON: ${storeList.length}`);

    for (let i = 0; i < storeList.length; i++) {
      const [storeName, breederName, , name, region, countryCode] = storeList[i];
      console.log(`Scraping store ${i + 1}/${storeList.length}: ${storeName}`);
      const { location, logo, species, markerPosition } = await scrapeStoreInfo(storeName, breederName, region, countryCode);
      
      const breederData = {
        breeder: breederName,
        name: name,
        location,
        logo,
        species,
        links: [`https://www.morphmarket.com/stores/${storeName}/`],
        markerPosition,
        region,
        countryCode
      };

      breeders.push(breederData);

      try {
        const docRef = await addDoc(collection(db, "breeders"), breederData);
        console.log(`Breeder document written with ID: ${docRef.id}`);
      } catch (e) {
        console.error("Error adding breeder document: ", e);
      }

      // Add a delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(JSON.stringify(breeders, null, 2));
    console.log(`Total breeders scraped and added to Firestore: ${breeders.length}`);
  } catch (error) {
    console.error('An error occurred during the scraping process:', error);
  }
}

scrapeBreeders();