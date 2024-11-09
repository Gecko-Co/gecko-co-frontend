import axios from 'axios';
import * as cheerio from 'cheerio';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
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

async function readCheckpoint() {
  try {
    const data = await fs.readFile('checkpoint.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log('No checkpoint found, starting from the beginning');
    return { lastProcessedIndex: -1 };
  }
}

async function writeCheckpoint(index) {
  await fs.writeFile('checkpoint.json', JSON.stringify({ lastProcessedIndex: index }));
}

const countryCoordinates = {
  GB: { lat: 55.3781, lng: -3.4360 },
  DK: { lat: 56.2639, lng: 9.5018 },
  CA: { lat: 56.1304, lng: -106.3468 },
  FR: { lat: 46.2276, lng: 2.2137 },
  ZA: { lat: -30.5595, lng: 22.9375 },
  MX: { lat: 23.6345, lng: -102.5528 },
  DE: { lat: 51.1657, lng: 10.4515 },
  IT: { lat: 41.8719, lng: 12.5674 },
  BE: { lat: 50.5039, lng: 4.4699 },
  PL: { lat: 51.9194, lng: 19.1451 },
  CZ: { lat: 49.8175, lng: 15.4730 },
  SE: { lat: 60.1282, lng: 18.6435 },
  ES: { lat: 40.4637, lng: -3.7492 },
  BG: { lat: 42.7339, lng: 25.4858 },
  NL: { lat: 52.1326, lng: 5.2913 },
  SK: { lat: 48.6690, lng: 19.6990 }
};

function addRandomOffset(coordinates) {
  const offsetRange = 0.1; // Adjust this value to control the spread
  const latOffset = (Math.random() - 0.5) * offsetRange;
  const lngOffset = (Math.random() - 0.5) * offsetRange;
  return {
    lat: coordinates.lat + latOffset,
    lng: coordinates.lng + lngOffset
  };
}

async function geocodeLocation(location, region, countryCode) {
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const maxRetries = 3;
  
  if (countryCode !== 'US' && countryCoordinates[countryCode]) {
    console.log(`Using predefined coordinates for ${countryCode} with random offset`);
    return addRandomOffset(countryCoordinates[countryCode]);
  }

  const queryFormats = [
    { q: `${location}, ${region}, ${countryCode}` },
    { q: `${location}, ${countryCode}` },
    { q: `${region}, ${countryCode}` }
  ];

  const fallbackFormat = { q: `${countryCode}` };

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

      await delay(2000 * Math.pow(2, attempt));
    }
  }

  console.warn(`Falling back to country-only geocoding for ${countryCode} with random offset`);
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
      return addRandomOffset({
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon)
      });
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

async function checkDuplicate(breederData) {
  const q = query(collection(db, "breeders"), 
    where("breeder", "==", breederData.breeder),
    where("name", "==", breederData.name),
    where("countryCode", "==", breederData.countryCode)
  );

  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

async function scrapeBreeders() {
  try {
    const storeList = await readStoreList();
    const checkpoint = await readCheckpoint();
    const startIndex = checkpoint.lastProcessedIndex + 1;

    console.log(`Total stores in JSON: ${storeList.length}`);
    console.log(`Resuming from index: ${startIndex}`);

    for (let i = startIndex; i < storeList.length; i++) {
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

      const isDuplicate = await checkDuplicate(breederData);
      if (isDuplicate) {
        console.log(`Duplicate found for ${breederName}. Skipping...`);
        await writeCheckpoint(i);
        continue;
      }

      try {
        const docRef = await addDoc(collection(db, "breeders"), breederData);
        console.log(`Breeder document written with ID: ${docRef.id}`);
        await writeCheckpoint(i);
      } catch (e) {
        console.error("Error adding breeder document: ", e);
        // Don't update checkpoint if there's an error, so we can retry this store
      }

      // Add a delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`Scraping process completed. Last processed index: ${storeList.length - 1}`);
  } catch (error) {
    console.error('An error occurred during the scraping process:', error);
  }
}

scrapeBreeders();