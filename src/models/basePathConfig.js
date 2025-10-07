// BasePathConfig entity/model
class BasePathConfig {
  constructor(basePath = '') {
    this.basePath = this.normalizeBasePath(basePath);
  }

  /**
   * Normalize the base path to ensure it follows the correct format
   * - If provided, it should start with '/' but not end with '/' (unless it's just '/')
   * @param {string} basePath - The base path to normalize
   * @returns {string} The normalized base path
   */
  normalizeBasePath(basePath) {
    if (!basePath || basePath === '/') {
      return '';
    }

    // Ensure it starts with /
    if (!basePath.startsWith('/')) {
      basePath = '/' + basePath;
    }

    // Remove trailing slash unless it's just '/'
    if (basePath.length > 1 && basePath.endsWith('/')) {
      basePath = basePath.slice(0, -1);
    }

    return basePath;
  }

  /**
   * Get the current base path
   * @returns {string} The current base path
   */
  getBasePath() {
    return this.basePath;
  }

  /**
   * Set a new base path after normalizing it
   * @param {string} basePath - The new base path to set
   */
  setBasePath(basePath) {
    this.basePath = this.normalizeBasePath(basePath);
  }

  /**
   * Check if a base path is configured (not empty)
   * @returns {boolean} True if a base path is configured, false otherwise
   */
  isConfigured() {
    return this.basePath && this.basePath !== '';
  }

  /**
   * Validate base path format
   * @param {string} basePath - The base path to validate
   * @returns {boolean} True if valid, false otherwise
   */
  static validateBasePath(basePath) {
    // Allow empty base path (default behavior)
    if (!basePath) return true;
    
    // Should start with '/' if not empty
    if (!basePath.startsWith('/')) return false;
    
    // Should not contain URL control characters
    const controlChars = /[<>#%{}|\^~\[\]]/;
    if (controlChars.test(basePath)) return false;
    
    return true;
  }
}

// Export a singleton instance or a constructor
module.exports = BasePathConfig;