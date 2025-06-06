import fs from 'fs';
import path from 'path';
import readline from 'readline';
import CryptoJS from 'crypto-js';

const decrypt = (encrypted, key) => {
  const encodedKey = CryptoJS.enc.Hex.parse(key.padStart(64, '0'));
  const decrypted = CryptoJS.AES.decrypt(encrypted, encodedKey, {
    mode: CryptoJS.mode.ECB,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
};

const inputFilePath = path.join('.', 'encrypted_users.csv');
const outputFilePath = path.join('.', 'decrypted_users.csv');

const reader = readline.createInterface({
  input: fs.createReadStream(inputFilePath),
  crlfDelay: Infinity,
});

const writer = fs.createWriteStream(outputFilePath, { flags: 'w' });
writer.write('_timestamp,user_id,store\n');

let isFirstLine = true;

reader.on('line', (line) => {
  if (isFirstLine) {
    isFirstLine = false;
    return;
  }

  const [timestamp, encryptedUserId, storeKey] = line.split(',');

  try {
    const decryptedUserId = decrypt(encryptedUserId.trim(), storeKey.trim());

    console.log(`Encrypted: ${encryptedUserId.trim()}`);
    console.log(`Key:       ${storeKey.trim()}`);
    console.log(`Decrypted: ${decryptedUserId}`);

    writer.write(`${timestamp},${decryptedUserId},${storeKey}\n`);
  } catch (err) {
    console.error(`Decryption failed for line: ${line}`, err);
    writer.write(`${timestamp},,${storeKey}\n`);
  }
});

reader.on('close', () => {
  writer.end();
  console.log('Decryption complete. Output saved to decrypted_users.csv');
});