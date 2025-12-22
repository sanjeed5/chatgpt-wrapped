/**
 * ChatGPT Wrapped - Data Parser
 * Handles ZIP file parsing to extract conversations.json
 */

const Parser = {
  /**
   * Parse uploaded ZIP file
   * @param {File} file - The uploaded ZIP file
   * @param {Function} onStatus - Status update callback
   * @returns {Promise<Array>} - Parsed conversations array
   */
  async parse(file, onStatus = () => {}) {
    const fileName = file.name.toLowerCase();
    
    if (!fileName.endsWith('.zip')) {
      throw new Error('Please upload the .zip file from your ChatGPT export.');
    }
    
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
        throw new Error('Could not find conversations.json in the ZIP file. Make sure you uploaded the correct ChatGPT export.');
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
      if (error.message.includes('conversations.json') || error.message.includes('ChatGPT export')) {
        throw error;
      }
      throw new Error('Failed to read ZIP file. Make sure it\'s a valid ChatGPT export.');
    }
  }
};
