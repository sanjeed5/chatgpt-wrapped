import JSZip from 'jszip';
import type { Conversation } from '../types';

export async function parseFile(file: File): Promise<Conversation[]> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.zip')) {
    return parseZip(file);
  } else if (fileName.endsWith('.json')) {
    return parseJson(file);
  } else {
    throw new Error('Unsupported file type. Please upload a .zip or .json file.');
  }
}

async function parseZip(file: File): Promise<Conversation[]> {
  try {
    const zip = await JSZip.loadAsync(file);

    // Look for conversations.json in the ZIP
    let conversationsFile: JSZip.JSZipObject | null = null;

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

    const jsonString = await conversationsFile.async('string');
    const conversations = JSON.parse(jsonString);

    if (!Array.isArray(conversations)) {
      throw new Error('Invalid conversations.json format.');
    }

    return conversations;
  } catch (error) {
    if (error instanceof Error && error.message.includes('conversations.json')) {
      throw error;
    }
    throw new Error("Failed to read ZIP file. Make sure it's a valid ChatGPT export.");
  }
}

async function parseJson(file: File): Promise<Conversation[]> {
  try {
    const text = await file.text();
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
