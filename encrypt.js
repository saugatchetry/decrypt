import fs from 'fs';
import path from 'path';
import readline from 'readline';
import CryptoJS from 'crypto-js';

const key = 'homeoffice';

const encrypt = (text, key) => {
  const encodedKey = CryptoJS.enc.Hex.parse(key.padStart(64, '0'));
  return CryptoJS.AES.encrypt(text, encodedKey, {
    mode: CryptoJS.mode.ECB,
  }).toString();
};

const inputFilePath = path.join('.', 'plain_users.txt');
const outputFilePath = path.join('.', 'encrypted_users.txt');

const reader = readline.createInterface({
  input: fs.createReadStream(inputFilePath),
  crlfDelay: Infinity,
});

const writer = fs.createWriteStream(outputFilePath, { flags: 'w' });

reader.on('line', (line) => {
  const encrypted = encrypt(line.trim(), key);
  writer.write(encrypted + '\n');
});

reader.on('close', () => {
  writer.end();
  console.log('Encryption complete. Output saved to encrypted_users.txt');
});
