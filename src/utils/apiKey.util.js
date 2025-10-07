/**
 * API Key Utility Functions
 * Contains functions for generating, validating, storing, and retrieving API keys
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { API_KEY_FILE_PATH, API_KEY_REGEX, API_KEY_FILE_PERMISSIONS } = require('../../config/security');

/**
 * Generates a cryptographically secure random API key
 * @returns {string} A 64-character hexadecimal API key
 */
function generateApiKey() {
  // Generate 32 bytes (256 bits) of random data and convert to hex
  // 32 bytes = 64 hex characters
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validates an API key format
 * @param {string} apiKey - The API key to validate
 * @returns {boolean} True if the API key has a valid format, false otherwise
 */
function validateApiKey(apiKey) {
  if (typeof apiKey !== 'string') {
    return false;
  }
  
  return API_KEY_REGEX.test(apiKey);
}

/**
 * Checks if the API key file exists
 * @returns {Promise<boolean>} True if the file exists, false otherwise
 */
async function apiFileExists() {
  try {
    await fs.access(API_KEY_FILE_PATH);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Stores an API key to the file system
 * @param {string} apiKey - The API key to store
 * @returns {Promise<void>}
 */
async function storeApiKey(apiKey) {
  // Write the API key to the specified file
  await fs.writeFile(API_KEY_FILE_PATH, apiKey, 'utf8');
  
  // Set appropriate file permissions to restrict access (read/write for owner only)
  try {
    await fs.chmod(API_KEY_FILE_PATH, API_KEY_FILE_PERMISSIONS);
  } catch (error) {
    // On Windows, chmod may not work as expected, so we'll log but continue
    console.warn(`Could not set file permissions on ${API_KEY_FILE_PATH}:`, error.message);
  }
}

/**
 * Retrieves an API key from the file system
 * @returns {Promise<string|null>} The API key if found, null otherwise
 */
async function retrieveApiKey() {
  try {
    const apiKey = await fs.readFile(API_KEY_FILE_PATH, 'utf8');
    return apiKey.trim(); // Remove any whitespace that might have been added
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File does not exist
      return null;
    }
    // Some other error occurred (e.g., permission denied)
    throw error;
  }
}

/**
 * Generates and stores an API key if one doesn't already exist
 * @returns {Promise<string>} The existing or newly generated API key
 */
async function generateAndStoreApiKeyIfNeeded() {
  // Check if an API key already exists
  if (await apiFileExists()) {
    // Return the existing key
    return await retrieveApiKey();
  }
  
  // No key exists, so generate a new one
  const newApiKey = generateApiKey();
  await storeApiKey(newApiKey);
  
  return newApiKey;
}

module.exports = {
  generateApiKey,
  validateApiKey,
  apiFileExists,
  storeApiKey,
  retrieveApiKey,
  generateAndStoreApiKeyIfNeeded
};