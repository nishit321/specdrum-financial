// Email and website checks shared by the browser and the API.
// International domains (bob@exämple.com, www.café.com) are allowed: they are converted to
// their ASCII form (xn--…) first, then checked like any other domain.

// the part before the @: same rule as zod's standard email check
const LOCAL_PART = /^(?:[A-Za-z0-9_'+-]+\.)*[A-Za-z0-9_'+-]*[A-Za-z0-9_+-]$/;
const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const TOP_LEVEL = /^(?:[a-z]{2,63}|xn--[a-z0-9-]{1,59})$/;

/** "exämple.com" → "xn--exmple-cua.com"; null for anything that is not a real domain name. */
export function asciiHostname(domain: string): string | null {
  // the URL parser would quietly accept ports, credentials, paths and IP literals
  if (!domain || /[\s/\\?#%:@[\]]/.test(domain)) return null;
  let host: string;
  try {
    host = new URL(`http://${domain}`).hostname;
  } catch {
    return null;
  }
  const labels = host.split('.');
  if (host.length > 253 || labels.length < 2 || !labels.every((l) => LABEL.test(l))) return null;
  return TOP_LEVEL.test(labels[labels.length - 1]) ? host : null;
}

/** The address with its domain in ASCII, ready for an email header; null when it is not a usable address. */
export function asciiEmail(value: string): string | null {
  const at = value.lastIndexOf('@');
  if (at < 1 || at > 64 || !LOCAL_PART.test(value.slice(0, at))) return null;
  const host = asciiHostname(value.slice(at + 1));
  return host ? `${value.slice(0, at)}@${host}` : null;
}

const WEBSITE = /^(https?:\/\/)?([^/?#]+)([/?#]\S*)?$/i;

/** "www.yourbusiness.com", "https://café.com/menu"; no ports, credentials or IP addresses. */
export function isWebsite(value: string): boolean {
  const m = WEBSITE.exec(value);
  return !!m && asciiHostname(m[2]) !== null;
}

/** The same website with its domain in ASCII form: "https://卸ッ.jp/x" → "https://xn--….jp/x". */
export function asciiWebsite(value: string): string {
  const m = WEBSITE.exec(value);
  const host = m && asciiHostname(m[2]);
  return m && host ? `${m[1] ?? ''}${host}${m[3] ?? ''}` : value;
}
