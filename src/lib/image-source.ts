// Remote images are fetched by the browser, never by the server image optimizer.
export function validImageSource(value: string | null | undefined): string | null {
  const source = value?.trim();
  if (!source || source.length > 2000 || /[\\\u0000-\u001f\u007f]/.test(source)) return null;
  if (/^\/images\/[\w/ .%-]+$/.test(source)) {
    try {
      const decoded = decodeURIComponent(source);
      if (decoded.split("/").some(segment => segment === "." || segment === "..") || /[\\\u0000-\u001f\u007f]/.test(decoded)) return null;
      return source;
    } catch { return null; }
  }
  try {
    const url = new URL(source);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export function imageSource(value: string | null | undefined, fallback = "/images/hero.png") {
  const src = validImageSource(value) ?? fallback;
  return { src, unoptimized: src.startsWith("https://") };
}
