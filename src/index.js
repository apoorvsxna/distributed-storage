import path from 'path';
import { splitFile } from './chunker.js';
import { storeChunks } from './storage.js';
import { retrieveChunks } from './retriever.js';

async function main() {
    const filePath = path.resolve('../test.pdf'); // file path
    const chunkSize = 150 * 1024; // 150 KB chunks
    const folderPaths = [
        path.resolve('../data/folder1'),
        path.resolve('../data/folder2'),
        path.resolve('../data/folder3'),
    ];
    const outputFilePath = path.resolve('./output.pdf'); // output file path

    try {
        // Step 1: Chunk and store the file
        const chunks = await splitFile(filePath, chunkSize);
        await storeChunks(chunks, folderPaths);
        console.log('File successfully chunked and stored.');

        // Step 2: Retrieve and reassemble the file
        await retrieveChunks(folderPaths, outputFilePath);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

main();
