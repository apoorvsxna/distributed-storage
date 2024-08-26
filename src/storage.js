import fs from 'fs/promises';
import path from 'path';

export async function storeChunks(chunks, folderPaths) {
    for (const chunk of chunks) {
        const folderPath = folderPaths[chunk.index % folderPaths.length];
        const filePath = path.join(folderPath, `chunk_${chunk.index}`);
        await fs.writeFile(filePath, chunk.data);
    }
}
