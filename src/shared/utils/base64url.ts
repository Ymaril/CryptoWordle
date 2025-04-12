export function encodeBase64Url(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeBase64Url(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = 4 - (base64.length % 4);
  return decodeURIComponent(
    escape(atob(pad !== 4 ? base64 + "=".repeat(pad) : base64))
  );
}
