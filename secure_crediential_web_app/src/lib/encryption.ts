import CryptoJS from 'crypto-js';

// Use a constant salt for master key encryption
const MASTER_KEY_SALT = 'KeyYatri_2025';

export const encryptData = (data: string, masterKey: string): string => {
  return CryptoJS.AES.encrypt(data, masterKey).toString();
};

export const decryptData = (encryptedData: string, masterKey: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, masterKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Encrypt master key before storing in localStorage
export const encryptMasterKey = (masterKey: string): string => {
  return CryptoJS.AES.encrypt(masterKey, MASTER_KEY_SALT).toString();
};

// Decrypt master key from localStorage
export const decryptMasterKey = (encryptedMasterKey: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedMasterKey, MASTER_KEY_SALT);
  return bytes.toString(CryptoJS.enc.Utf8);
};