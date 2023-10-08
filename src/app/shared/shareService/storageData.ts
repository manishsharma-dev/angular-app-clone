import * as CryptoJS from 'crypto-js';
import sha256 from 'crypto-js/sha256';
const AES_SECRET_KEY = "mysecretkey";
const hash = CryptoJS.enc.Hex.parse(AES_SECRET_KEY);
const key = CryptoJS.lib.WordArray.create(hash.words.slice(0, 16 / 4));
const AES_IV_KEY = "[B@6108b2d7";
export function setEncryptedData(data?: any, key?: string) {
  if (data && key) {
    const payloadData = {
      id: data.id,
      type: data.type
    }
    const setData = CryptoJS.AES.encrypt(JSON.stringify(payloadData), key).toString(); //Encryption part
    sessionStorage.setItem("storageData", JSON.stringify(setData));
  }

}

export function getDecryptedData(key?: string) {
  const getData = JSON.parse(sessionStorage.getItem("storageData"));
  if (!getData) {
    return "";
  }
  var decryptedData = CryptoJS.AES.decrypt(getData, key).toString(CryptoJS.enc.Utf8); //Decryption part

  return JSON.parse(decryptedData);
}

export function removeData() {
  sessionStorage.removeItem("storageData");
}

export function setEncryptedRoleData(data?: any, key?: string) {
  if (data && key) {
    const payloadData = {
      id: data.id,
      type: data.type
    }
    const setData = CryptoJS.AES.encrypt(JSON.stringify(payloadData), key).toString(); //Encryption part
    sessionStorage.setItem("storageRoleData", JSON.stringify(setData));

  }
}

export function getDecryptedRoleData(key?: string) {
  const getData = JSON.parse(sessionStorage.getItem("storageRoleData"));
  if (!getData) {
    return "";
  }
  var decryptedData = CryptoJS.AES.decrypt(getData, key).toString(CryptoJS.enc.Utf8); //Decryption part
  return JSON.parse(decryptedData);
}

export function setEncryptedProjectData(data?: any, key?: string) {
  if (data && key) {
    const payloadData = {
      id: data.id,
      type: data.type
    }
    const setData = CryptoJS.AES.encrypt(JSON.stringify(payloadData), key).toString(); //Encryption part
    sessionStorage.setItem("storageProjectData", JSON.stringify(setData));

  }
}

export function getDecryptedProjectData(key?: string) {
  const getData = JSON.parse(sessionStorage.getItem("storageProjectData"));
  if (!getData) {
    return "";
  }
  var decryptedData = CryptoJS.AES.decrypt(getData, key).toString(CryptoJS.enc.Utf8); //Decryption part
  return JSON.parse(decryptedData);
}

export function setSessionData(data?: any, key?: string) {
  let getData = JSON.parse(sessionStorage.getItem("sessionData"));
  if (!getData) {
    decryptedData = {};
  }
  else {
    var decryptedData = JSON.parse(CryptoJS.AES.decrypt(getData, "AESSHA256SessionData").toString(CryptoJS.enc.Utf8));
  }
  decryptedData[key] = data;
  const setData = CryptoJS.AES.encrypt(JSON.stringify(decryptedData), "AESSHA256SessionData").toString();
  sessionStorage.setItem("sessionData", JSON.stringify(setData));
}

export function getSessionData(key?: string) {
  let getData = JSON.parse(sessionStorage.getItem("sessionData"));
  if (!getData) return null;
  var decryptedData = JSON.parse(CryptoJS.AES.decrypt(getData, "AESSHA256SessionData").toString(CryptoJS.enc.Utf8));
  return decryptedData[key] ?? null;
}

export function decryptText(encryptedText: string) {

  return CryptoJS.AES.decrypt(encryptedText, CryptoJS.enc.Base64.parse(AES_SECRET_KEY), { iv: CryptoJS.enc.Base64.parse(AES_IV_KEY) }).toString(CryptoJS.enc.Utf8);
}

export function encryptText(encryptedText: string) {
  let encryptText = String(encryptedText);
  return CryptoJS.AES.encrypt(encryptText, AES_SECRET_KEY).toString();
}

export function decryptTextWithKey(encryptedText: string, ivKey: string) {
  const AES_SECRET_KEY = "";
  return CryptoJS.AES.decrypt(encryptedText, CryptoJS.enc.Base64.parse(AES_SECRET_KEY), { iv: CryptoJS.enc.Base64.parse(AES_IV_KEY) }).toString(CryptoJS.enc.Utf8);
}


