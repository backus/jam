// To parse this data:
//
//   import { Convert, SrpSession, WrappedKeyMaterial, LocalAuthSession, LoginCredentialsV0, LoginPreviewV0, Cookie, BrowserState, RawCredentials, Secret, Info, Detail, LoginPreviewV1, LoginV1 } from "./file";
//
//   const srpSession = Convert.toSrpSession(json);
//   const wrappedKeyMaterial = Convert.toWrappedKeyMaterial(json);
//   const localAuthSession = Convert.toLocalAuthSession(json);
//   const loginCredentialsV0 = Convert.toLoginCredentialsV0(json);
//   const loginPreviewV0 = Convert.toLoginPreviewV0(json);
//   const cookie = Convert.toCookie(json);
//   const browserState = Convert.toBrowserState(json);
//   const rawCredentials = Convert.toRawCredentials(json);
//   const secret = Convert.toSecret(json);
//   const info = Convert.toInfo(json);
//   const detail = Convert.toDetail(json);
//   const loginPreviewV1 = Convert.toLoginPreviewV1(json);
//   const loginV1 = Convert.toLoginV1(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface LocalAuthSession {
  srpSession: SrpSession;
  wrappedKeyMaterial: WrappedKeyMaterial;
}

export interface SrpSession {
  id: string;
  key: string;
}

export interface WrappedKeyMaterial {
  algorithm: string;
  ciphertext: string;
  iv: string;
  salt: string;
}

export interface LoginCredentialsV0 {
  domain: null | string;
  note?: string;
  password: string;
  title: string;
  username: string;
}

export interface LoginPreviewV0 {
  domain: null | string;
  title: string;
}

export interface LoginPreviewV1 {
  info: Info;
}

export interface Info {
  domain: null | string;
  title: string;
}

export interface LoginV1 {
  detail: Detail;
  info: Info;
  secret: Secret;
}

export interface Detail {
  note?: string;
}

export interface Secret {
  browserState?: BrowserState;
  rawCredentials?: RawCredentials;
}

export interface BrowserState {
  cookies: Cookie[];
  localStorage: { [key: string]: string };
  meta: Meta;
  sessionStorage: { [key: string]: string };
}

export interface Cookie {
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

export interface Meta {
  extractionUrl: string;
}

export interface RawCredentials {
  password: string;
  username: string;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toSrpSession(json: string): SrpSession {
    return cast(JSON.parse(json), r("SrpSession"));
  }

  public static srpSessionToJson(value: SrpSession): string {
    return JSON.stringify(uncast(value, r("SrpSession")), null, 2);
  }

  public static toWrappedKeyMaterial(json: string): WrappedKeyMaterial {
    return cast(JSON.parse(json), r("WrappedKeyMaterial"));
  }

  public static wrappedKeyMaterialToJson(value: WrappedKeyMaterial): string {
    return JSON.stringify(uncast(value, r("WrappedKeyMaterial")), null, 2);
  }

  public static toLocalAuthSession(json: string): LocalAuthSession {
    return cast(JSON.parse(json), r("LocalAuthSession"));
  }

  public static localAuthSessionToJson(value: LocalAuthSession): string {
    return JSON.stringify(uncast(value, r("LocalAuthSession")), null, 2);
  }

  public static toLoginCredentialsV0(json: string): LoginCredentialsV0 {
    return cast(JSON.parse(json), r("LoginCredentialsV0"));
  }

  public static loginCredentialsV0ToJson(value: LoginCredentialsV0): string {
    return JSON.stringify(uncast(value, r("LoginCredentialsV0")), null, 2);
  }

  public static toLoginPreviewV0(json: string): LoginPreviewV0 {
    return cast(JSON.parse(json), r("LoginPreviewV0"));
  }

  public static loginPreviewV0ToJson(value: LoginPreviewV0): string {
    return JSON.stringify(uncast(value, r("LoginPreviewV0")), null, 2);
  }

  public static toCookie(json: string): Cookie {
    return cast(JSON.parse(json), r("Cookie"));
  }

  public static cookieToJson(value: Cookie): string {
    return JSON.stringify(uncast(value, r("Cookie")), null, 2);
  }

  public static toBrowserState(json: string): BrowserState {
    return cast(JSON.parse(json), r("BrowserState"));
  }

  public static browserStateToJson(value: BrowserState): string {
    return JSON.stringify(uncast(value, r("BrowserState")), null, 2);
  }

  public static toRawCredentials(json: string): RawCredentials {
    return cast(JSON.parse(json), r("RawCredentials"));
  }

  public static rawCredentialsToJson(value: RawCredentials): string {
    return JSON.stringify(uncast(value, r("RawCredentials")), null, 2);
  }

  public static toSecret(json: string): Secret {
    return cast(JSON.parse(json), r("Secret"));
  }

  public static secretToJson(value: Secret): string {
    return JSON.stringify(uncast(value, r("Secret")), null, 2);
  }

  public static toInfo(json: string): Info {
    return cast(JSON.parse(json), r("Info"));
  }

  public static infoToJson(value: Info): string {
    return JSON.stringify(uncast(value, r("Info")), null, 2);
  }

  public static toDetail(json: string): Detail {
    return cast(JSON.parse(json), r("Detail"));
  }

  public static detailToJson(value: Detail): string {
    return JSON.stringify(uncast(value, r("Detail")), null, 2);
  }

  public static toLoginPreviewV1(json: string): LoginPreviewV1 {
    return cast(JSON.parse(json), r("LoginPreviewV1"));
  }

  public static loginPreviewV1ToJson(value: LoginPreviewV1): string {
    return JSON.stringify(uncast(value, r("LoginPreviewV1")), null, 2);
  }

  public static toLoginV1(json: string): LoginV1 {
    return cast(JSON.parse(json), r("LoginV1"));
  }

  public static loginV1ToJson(value: LoginV1): string {
    return JSON.stringify(uncast(value, r("LoginV1")), null, 2);
  }
}

function invalidValue(typ: any, val: any, key: any = ""): never {
  if (key) {
    throw Error(
      `Invalid value for key "${key}". Expected type ${JSON.stringify(
        typ
      )} but got ${JSON.stringify(val)}`
    );
  }
  throw Error(
    `Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`
  );
}

function jsonToJSProps(typ: any): any {
  if (typ.jsonToJS === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => (map[p.json] = { key: p.js, typ: p.typ }));
    typ.jsonToJS = map;
  }
  return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
  if (typ.jsToJSON === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => (map[p.js] = { key: p.json, typ: p.typ }));
    typ.jsToJSON = map;
  }
  return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ""): any {
  function transformPrimitive(typ: string, val: any): any {
    if (typeof typ === typeof val) return val;
    return invalidValue(typ, val, key);
  }

  function transformUnion(typs: any[], val: any): any {
    // val must validate against one typ in typs
    const l = typs.length;
    for (let i = 0; i < l; i++) {
      const typ = typs[i];
      try {
        return transform(val, typ, getProps);
      } catch (_) {}
    }
    return invalidValue(typs, val);
  }

  function transformEnum(cases: string[], val: any): any {
    if (cases.indexOf(val) !== -1) return val;
    return invalidValue(cases, val);
  }

  function transformArray(typ: any, val: any): any {
    // val must be an array with no invalid elements
    if (!Array.isArray(val)) return invalidValue("array", val);
    return val.map((el) => transform(el, typ, getProps));
  }

  function transformDate(val: any): any {
    if (val === null) {
      return null;
    }
    const d = new Date(val);
    if (isNaN(d.valueOf())) {
      return invalidValue("Date", val);
    }
    return d;
  }

  function transformObject(
    props: { [k: string]: any },
    additional: any,
    val: any
  ): any {
    if (val === null || typeof val !== "object" || Array.isArray(val)) {
      return invalidValue("object", val);
    }
    const result: any = {};
    Object.getOwnPropertyNames(props).forEach((key) => {
      const prop = props[key];
      const v = Object.prototype.hasOwnProperty.call(val, key)
        ? val[key]
        : undefined;
      result[prop.key] = transform(v, prop.typ, getProps, prop.key);
    });
    Object.getOwnPropertyNames(val).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(props, key)) {
        result[key] = transform(val[key], additional, getProps, key);
      }
    });
    return result;
  }

  if (typ === "any") return val;
  if (typ === null) {
    if (val === null) return val;
    return invalidValue(typ, val);
  }
  if (typ === false) return invalidValue(typ, val);
  while (typeof typ === "object" && typ.ref !== undefined) {
    typ = typeMap[typ.ref];
  }
  if (Array.isArray(typ)) return transformEnum(typ, val);
  if (typeof typ === "object") {
    return typ.hasOwnProperty("unionMembers")
      ? transformUnion(typ.unionMembers, val)
      : typ.hasOwnProperty("arrayItems")
      ? transformArray(typ.arrayItems, val)
      : typ.hasOwnProperty("props")
      ? transformObject(getProps(typ), typ.additional, val)
      : invalidValue(typ, val);
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== "number") return transformDate(val);
  return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
  return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
  return { arrayItems: typ };
}

function u(...typs: any[]) {
  return { unionMembers: typs };
}

function o(props: any[], additional: any) {
  return { props, additional };
}

function m(additional: any) {
  return { props: [], additional };
}

function r(name: string) {
  return { ref: name };
}

const typeMap: any = {
  LocalAuthSession: o(
    [
      { json: "srpSession", js: "srpSession", typ: r("SrpSession") },
      {
        json: "wrappedKeyMaterial",
        js: "wrappedKeyMaterial",
        typ: r("WrappedKeyMaterial"),
      },
    ],
    "any"
  ),
  SrpSession: o(
    [
      { json: "id", js: "id", typ: "" },
      { json: "key", js: "key", typ: "" },
    ],
    "any"
  ),
  WrappedKeyMaterial: o(
    [
      { json: "algorithm", js: "algorithm", typ: "" },
      { json: "ciphertext", js: "ciphertext", typ: "" },
      { json: "iv", js: "iv", typ: "" },
      { json: "salt", js: "salt", typ: "" },
    ],
    "any"
  ),
  LoginCredentialsV0: o(
    [
      { json: "domain", js: "domain", typ: u(null, "") },
      { json: "note", js: "note", typ: u(undefined, "") },
      { json: "password", js: "password", typ: "" },
      { json: "title", js: "title", typ: "" },
      { json: "username", js: "username", typ: "" },
    ],
    "any"
  ),
  LoginPreviewV0: o(
    [
      { json: "domain", js: "domain", typ: u(null, "") },
      { json: "title", js: "title", typ: "" },
    ],
    "any"
  ),
  LoginPreviewV1: o([{ json: "info", js: "info", typ: r("Info") }], "any"),
  Info: o(
    [
      { json: "domain", js: "domain", typ: u(null, "") },
      { json: "title", js: "title", typ: "" },
    ],
    "any"
  ),
  LoginV1: o(
    [
      { json: "detail", js: "detail", typ: r("Detail") },
      { json: "info", js: "info", typ: r("Info") },
      { json: "secret", js: "secret", typ: r("Secret") },
    ],
    "any"
  ),
  Detail: o([{ json: "note", js: "note", typ: u(undefined, "") }], "any"),
  Secret: o(
    [
      {
        json: "browserState",
        js: "browserState",
        typ: u(undefined, r("BrowserState")),
      },
      {
        json: "rawCredentials",
        js: "rawCredentials",
        typ: u(undefined, r("RawCredentials")),
      },
    ],
    "any"
  ),
  BrowserState: o(
    [
      { json: "cookies", js: "cookies", typ: a(r("Cookie")) },
      { json: "localStorage", js: "localStorage", typ: m("") },
      { json: "meta", js: "meta", typ: r("Meta") },
      { json: "sessionStorage", js: "sessionStorage", typ: m("") },
    ],
    "any"
  ),
  Cookie: o(
    [
      { json: "domain", js: "domain", typ: "" },
      { json: "expirationDate", js: "expirationDate", typ: u(undefined, 3.14) },
      { json: "hostOnly", js: "hostOnly", typ: true },
      { json: "httpOnly", js: "httpOnly", typ: true },
      { json: "name", js: "name", typ: "" },
      { json: "path", js: "path", typ: "" },
      { json: "sameSite", js: "sameSite", typ: "" },
      { json: "secure", js: "secure", typ: true },
      { json: "session", js: "session", typ: true },
      { json: "storeId", js: "storeId", typ: "" },
      { json: "value", js: "value", typ: "" },
    ],
    "any"
  ),
  Meta: o([{ json: "extractionUrl", js: "extractionUrl", typ: "" }], "any"),
  RawCredentials: o(
    [
      { json: "password", js: "password", typ: "" },
      { json: "username", js: "username", typ: "" },
    ],
    "any"
  ),
};
