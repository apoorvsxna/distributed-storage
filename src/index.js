import { uploadFile, downloadFile, createFileFromBuffer } from './fileHandler.js';

uploadFile('./test.pdf');

// Step 1: Download the file chunks and reassemble them into a buffer
const fileBuffer = downloadFile('./test.pdf');

// Step 2: Write the buffer to a new file on disk (e.g., downloaded_test.pdf)
createFileFromBuffer('./downloaded_test.pdf', fileBuffer);

console.log('File downloaded and reassembled as downloaded_test.pdf');
