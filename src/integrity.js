import * as crypto from 'crypto';

// Generate an MD5 checksum for a file buffer to ensure data integrity
export function generateChecksum(fileBuffer) {
    const hash = crypto.createHash('md5');
    hash.update(fileBuffer);
    const checksum = hash.digest('hex'); // Return MD5 hash as a hexadecimal string
    return checksum;
}

// Compare the checksum of a file buffer with the original checksum for integrity verification
export function checkIntegrity(fileBuffer, originalChecksum) {
    const newChecksum = generateChecksum(fileBuffer);
    return newChecksum === originalChecksum; // Return true if the checksums match
}