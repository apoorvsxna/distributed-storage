import fs from 'fs';
import path from 'path';

export function splitFile(filePath, chunkSize) {
    return new Promise((resolve, reject) => {
        const fileStream = fs.createReadStream(filePath, { highWaterMark: chunkSize });
        const chunks = [];
        let chunkIndex = 0;

        fileStream.on('data', (chunk) => {
            chunks.push({
                index: chunkIndex,
                data: chunk,
            });
            chunkIndex++;
        });

        fileStream.on('end', () => resolve(chunks));
        fileStream.on('error', (err) => reject(err));
    });
}
