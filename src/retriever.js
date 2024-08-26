import fs from 'fs/promises';
import path from 'path';

export async function retrieveChunks(folderPaths, outputFilePath) {
    const chunkFiles = [];

    // Collect all chunk files from the folders
    for (const folderPath of folderPaths) {
        const files = await fs.readdir(folderPath);
        chunkFiles.push(...files.map(file => path.join(folderPath, file)));
    }

    // Sort the chunk files based on the index in their filename
    chunkFiles.sort((a, b) => {
        const indexA = parseInt(path.basename(a).split('_')[1], 10);
        const indexB = parseInt(path.basename(b).split('_')[1], 10);
        return indexA - indexB;
    });

    // Reassemble the file by concatenating all chunks
    const writeStream = await fs.open(outputFilePath, 'w');
    for (const chunkFile of chunkFiles) {
        const data = await fs.readFile(chunkFile);
        await writeStream.write(data);
    }

    await writeStream.close();
    console.log(`File successfully reassembled at ${outputFilePath}`);
}
