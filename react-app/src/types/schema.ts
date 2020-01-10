// These typings aren't actually for import, but instead they're input for quicktype. These typings
// (and the corresponding tight JSON serializer code) were originally generated using example JSON
// files, but that stopped working once we added BrowserState stuff and it couldn't detect mappings.
//
// For historical context, look at 6922bbb7fca6c88d96fcb9950efa6f43c61fe063 to see those JSON files.

interface SrpSession {
  id: string;
  key: string;
}

interface WrappedKeyMaterial {
  ciphertext: string;
  iv: string;
  salt: string;
  algorithm: string;
}

interface LocalAuthSession {
  srpSession: SrpSession;
  wrappedKeyMaterial: WrappedKeyMaterial;
}

interface LoginCredentialsV0 {
  title: string;
  domain: null | string;
  username: string;
  password: string;
  note?: string;
}

interface LoginPreviewV0 {
  title: string;
  domain: null | string;
}

interface Cookie {
  domain: string;
  expirationDate?: number;
  hostOnly: boolean;
  httpOnly: boolean;
  name: string;
  path: string;
  sameSite: string;
  secure: boolean;
  session: boolean;
  storeId: string;
  value: string;
}

interface BrowserState {
  meta: { extractionUrl: string };
  cookies: Cookie[];
  localStorage: { [key: string]: string };
  sessionStorage: { [key: string]: string };
}

interface RawCredentials {
  username: string;
  password: string;
}

interface Secret {
  browserState?: BrowserState;
  rawCredentials?: RawCredentials;
}

interface Info {
  title: string;
  domain: null | string;
}

interface Detail {
  note?: string;
}

interface LoginPreviewV1 {
  info: Info;
}

interface LoginV1 {
  info: Info;
  detail: Detail;
  secret: Secret;
}

// Empty export so TypeScript doesn't complain about this file
export {};
