/**
 * App Store Metadata Fetcher
 * 
 * Fetches app metadata from Google Play Store and Apple App Store
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

export interface AppMetadata {
  name: string;
  category: string;
  description: string;
  iconUrl: string;
  developer: string;
}

/**
 * Fetch app metadata from Google Play Store
 */
export async function fetchGooglePlayMetadata(packageName: string): Promise<AppMetadata | null> {
  try {
    const url = `https://play.google.com/store/apps/details?id=${packageName}&hl=en`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    
    // Extract app name
    const name = $('h1[itemprop="name"]').text().trim() || 
                 $('h1.Fd93Bb').text().trim();
    
    // Extract category
    const category = $('a[itemprop="genre"]').text().trim() ||
                     $('span[itemprop="genre"]').text().trim();
    
    // Extract description
    const description = $('div[itemprop="description"]').text().trim() ||
                       $('div[data-g-id="description"]').text().trim().substring(0, 500);
    
    // Extract icon URL
    const iconUrl = $('img[itemprop="image"]').attr('src') ||
                    $('img.T75of').attr('src') ||
                    '';
    
    // Extract developer
    const developer = $('a[href*="/store/apps/dev"]').first().text().trim() ||
                     $('div[itemprop="author"]').text().trim();

    if (!name) {
      return null;
    }

    return {
      name,
      category: category || 'Other',
      description: description || '',
      iconUrl: iconUrl.startsWith('//') ? `https:${iconUrl}` : iconUrl,
      developer
    };
  } catch (error) {
    console.error('Error fetching Google Play metadata:', error);
    return null;
  }
}

/**
 * Fetch app metadata from Apple App Store
 */
export async function fetchAppleStoreMetadata(bundleId: string): Promise<AppMetadata | null> {
  try {
    // Use iTunes Search API
    const url = `https://itunes.apple.com/lookup?bundleId=${bundleId}&entity=software&limit=1`;
    const response = await axios.get(url, {
      timeout: 10000
    });

    const data = response.data;
    
    if (!data.results || data.results.length === 0) {
      return null;
    }

    const app = data.results[0];
    
    return {
      name: app.trackName || '',
      category: app.primaryGenreName || 'Other',
      description: app.description || '',
      iconUrl: app.artworkUrl512 || app.artworkUrl100 || '',
      developer: app.artistName || ''
    };
  } catch (error) {
    console.error('Error fetching Apple App Store metadata:', error);
    return null;
  }
}

/**
 * Fetch app metadata based on OS and app ID
 */
export async function fetchAppMetadata(os: string, appId: string): Promise<AppMetadata | null> {
  if (!os || !appId) {
    return null;
  }

  const osLower = os.toLowerCase();
  
  if (osLower === 'android') {
    return await fetchGooglePlayMetadata(appId);
  } else if (osLower === 'ios') {
    return await fetchAppleStoreMetadata(appId);
  }
  
  return null;
}

