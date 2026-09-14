import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password: string;
    username: string;
  }

  export interface LoginEncryptionKey {
    algorithm: 'RSA-OAEP-256';
    keyId: string;
    publicKey: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

function arrayBufferToBase64(value: ArrayBuffer) {
  const bytes = new Uint8Array(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function pemToArrayBuffer(pem: string) {
  const base64 = pem
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replaceAll(/\s/g, '');
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0)).buffer;
}

async function encryptLoginPassword(
  password: string,
  encryptionKey: AuthApi.LoginEncryptionKey,
) {
  const publicKey = await crypto.subtle.importKey(
    'spki',
    pemToArrayBuffer(encryptionKey.publicKey),
    { hash: 'SHA-256', name: 'RSA-OAEP' },
    false,
    ['encrypt'],
  );
  const aesKey = await crypto.subtle.generateKey(
    { length: 256, name: 'AES-GCM' },
    true,
    ['encrypt'],
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(
    JSON.stringify({
      nonce: crypto.randomUUID(),
      password,
      timestamp: Date.now(),
    }),
  );
  const [encryptedPassword, rawAesKey] = await Promise.all([
    crypto.subtle.encrypt({ iv, name: 'AES-GCM' }, aesKey, plaintext),
    crypto.subtle.exportKey('raw', aesKey),
  ]);
  const encryptedKey = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    rawAesKey,
  );

  return {
    encryptedKey: arrayBufferToBase64(encryptedKey),
    encryptedPassword: arrayBufferToBase64(encryptedPassword),
    iv: arrayBufferToBase64(iv.buffer),
    keyId: encryptionKey.keyId,
  };
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  const encryptionKey = await requestClient.get<AuthApi.LoginEncryptionKey>(
    '/auth/encryption-key',
  );
  const encrypted = await encryptLoginPassword(data.password, encryptionKey);
  return requestClient.post<AuthApi.LoginResult>('/auth/login', {
    ...encrypted,
    username: data.username,
  });
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>(
    '/auth/refresh',
    undefined,
    {
      withCredentials: true,
    },
  );
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return baseRequestClient.post('/auth/logout', undefined, {
    withCredentials: true,
  });
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.get<string[]>('/auth/codes');
}
