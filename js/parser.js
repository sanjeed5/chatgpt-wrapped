/**
 * ChatGPT Wrapped - Data Parser
 * Handles ZIP and JSON file parsing
 */

const Parser = {
  /**
   * Parse uploaded file (ZIP or JSON)
   * @param {File} file - The uploaded file
   * @param {Function} onStatus - Status update callback
   * @returns {Promise<Array>} - Parsed conversations array
   */
  async parse(file, onStatus = () => {}) {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.zip')) {
      return this.parseZip(file, onStatus);
    } else if (fileName.endsWith('.json')) {
      return this.parseJson(file, onStatus);
    } else {
      throw new Error('Unsupported file type. Please upload a .zip or .json file.');
    }
  },

  /**
   * Parse ZIP file and extract conversations.json
   */
  async parseZip(file, onStatus) {
    onStatus('Extracting ZIP file...');
    
    try {
      const zip = await JSZip.loadAsync(file);
      
      // Look for conversations.json in the ZIP
      let conversationsFile = null;
      
      // Check root level first
      if (zip.files['conversations.json']) {
        conversationsFile = zip.files['conversations.json'];
      } else {
        // Search in subdirectories
        for (const [path, zipEntry] of Object.entries(zip.files)) {
          if (path.endsWith('conversations.json') && !zipEntry.dir) {
            conversationsFile = zipEntry;
            break;
          }
        }
      }
      
      if (!conversationsFile) {
        throw new Error('Could not find conversations.json in the ZIP file.');
      }
      
      onStatus('Reading conversations...');
      const jsonString = await conversationsFile.async('string');
      
      onStatus('Parsing data...');
      const conversations = JSON.parse(jsonString);
      
      if (!Array.isArray(conversations)) {
        throw new Error('Invalid conversations.json format.');
      }
      
      return conversations;
    } catch (error) {
      if (error.message.includes('conversations.json')) {
        throw error;
      }
      throw new Error('Failed to read ZIP file. Make sure it\'s a valid ChatGPT export.');
    }
  },

  /**
   * Parse JSON file directly
   */
  async parseJson(file, onStatus) {
    onStatus('Reading JSON file...');
    
    try {
      const text = await file.text();
      
      onStatus('Parsing data...');
      const conversations = JSON.parse(text);
      
      if (!Array.isArray(conversations)) {
        throw new Error('Invalid JSON format. Expected an array of conversations.');
      }
      
      return conversations;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON file. Could not parse the data.');
      }
      throw error;
    }
  }
};
