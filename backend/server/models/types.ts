export interface AesEncryptedBlob {
  ciphertext: string;
  iv: string;
  salt: string;
  algorithm: string;
}

export interface RsaEncryptedBlob {
  ciphertext: string;
  algorithm: string;
}
