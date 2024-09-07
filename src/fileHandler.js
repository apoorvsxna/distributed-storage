import * as fs from 'fs';
import * as path from 'path';
import { generateChecksum, checkIntegrity } from './integrity.js';

const storageNodes = ['folder1', 'folder2', 'folder3'];
const metadataFile = './metadata.json'; // File to store metadata

// Load metadata from a file if it exists
function loadMetadata() {
    if (fs.existsSync(metadataFile)) {
        const rawData = fs.readFileSync(metadataFile);
        return JSON.parse(rawData);
    } else {
        return [];
    }
}

// Save metadata to a file
function saveMetadata(metadata) {
    const data = JSON.stringify(metadata, null, 2); // Convert metadata to JSON with 2-space indentation
    fs.writeFileSync(metadataFile, data); // Save JSON to the metadata file
}

// Upload a file, chunk it, distribute chunks across storage nodes, and update metadata
export function uploadFile(filePath) {
    // Load existing metadata
    let metadataStore = loadMetadata();

    // 1. Read file and generate checksum for integrity verification
    const fileBuffer = fs.readFileSync(filePath);
    const checksum = generateChecksum(fileBuffer);

    // 2. Chunk the file into smaller parts
    const chunkArray = createChunks(fileBuffer);

    // Initialize metadata for the file
    const totalNodes = storageNodes.length;
    const fileMetadata = {
        fileName: filePath,      // File's original path
        checksum: checksum,      // MD5 checksum for the file
        chunkDetails: []         // To store chunk names and storage locations
    };

    // 3. Distribute chunks across storage nodes using round-robin approach
    for (let i = 0; i < chunkArray.length; i++) {
        const currentNode = storageNodes[i % totalNodes]; // Choose storage node using round-robin
        const chunkName = `${path.basename(filePath)}_chunk-${i}`; // Create a unique chunk name based on the file name

        // Ensure the storage node (directory) exists; create it if necessary
        ensureDirectoryExists(currentNode);

        // Upload the chunk to the chosen storage node
        uploadChunk(chunkArray[i], currentNode, chunkName);

        // Update the file metadata to track chunk name and storage node location
        fileMetadata.chunkDetails.push({
            chunkName: chunkName,
            storageNode: currentNode
        });
    }

    // 4. Store metadata in the global metadata store
    metadataStore.push(fileMetadata);
    saveMetadata(metadataStore); // Save the metadata to the file
    console.log("File uploaded successfully with metadata:", fileMetadata);
}

// Ensure that the directory (storage node) exists; create it if it doesn't
function ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory); // Create directory if it doesn't exist
    }
}

// Upload a single chunk to the specified storage node at specified path
export function uploadChunk(chunkBuffer, storageNode, chunkName) {
    const chunkPath = path.join(storageNode, chunkName);
    fs.writeFileSync(chunkPath, chunkBuffer);
    console.log(`Chunk uploaded to ${chunkPath}`);
}

// Download a file by fetching its chunks from storage nodes and reassembling them
export function downloadFile(filePath) {
    // Load metadata from file
    const metadataStore = loadMetadata();

    // 1. Retrieve file metadata to find chunk locations
    const fileMetadata = metadataStore.find(file => file.fileName === filePath);
    if (!fileMetadata) {
        throw new Error('File metadata not found.');
    }

    const chunkArray = [];

    // 2. Download each chunk from the respective storage node
    for (const chunkInfo of fileMetadata.chunkDetails) {
        const chunk = downloadChunk(chunkInfo.storageNode, chunkInfo.chunkName);
        chunkArray.push(chunk);
    }

    // 3. Reassemble the chunks into the original file buffer
    const fileBuffer = assembleChunks(chunkArray);
    return fileBuffer;
}

// Download a single chunk
export function downloadChunk(storageNode, chunkName) {
    const chunkPath = path.join(storageNode, chunkName); // Construct full path for the chunk
    if (fs.existsSync(chunkPath)) {
        return fs.readFileSync(chunkPath); // Read and return chunk data if it exists
    } else {
        throw new Error(`Chunk not found: ${chunkPath}`);
    }
}

// Split a file buffer into smaller chunks of 64 KB each
export function createChunks(fileBuffer) {
    const chunkSize = 64 * 1024; // 64 KB chunk size
    const chunkArray = [];

    for (let i = 0; i < fileBuffer.length; i += chunkSize) {
        const chunk = fileBuffer.slice(i, i + chunkSize);
        chunkArray.push(chunk);
    }

    return chunkArray;
}

// Reassemble an array of chunks into the original file buffer
export function assembleChunks(chunkArray) {
    const assembledBuffer = Buffer.concat(chunkArray);
    return assembledBuffer;
}

// Create a file from a buffer at specified file path
export function createFileFromBuffer(filePath, fileBuffer) {
    fs.writeFileSync(filePath, fileBuffer);
    console.log(`File created at ${filePath}`);
}
