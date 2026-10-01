export function videoSource(value: string | null | undefined): { type: "youtube" | "media"; src: string } | null {
  if (!value) return null;
  try {
    const local = /^\/(?!\/)/.test(value);
    const url = new URL(value, local ? "https://academy.invalid" : undefined);
    if (url.protocol !== "https:" || url.username || url.password || (local && (url.hostname !== "academy.invalid" || value.includes("\\")))) return null;
    const host = url.hostname.toLowerCase();
    let id: string | null = null;
    if (host === "youtu.be") id = url.pathname.slice(1);
    if (["youtube.com", "www.youtube.com", "m.youtube.com", "www.youtube-nocookie.com", "youtube-nocookie.com"].includes(host)) {
      id = url.pathname === "/watch" ? url.searchParams.get("v") : /^\/embed\/([^/]+)\/?$/.exec(url.pathname)?.[1] ?? null;
    }
    if (id && /^[A-Za-z0-9_-]{11}$/.test(id)) return { type: "youtube", src: `https://www.youtube.com/embed/${id}` };
    if (/\.(mp4|webm|ogv|ogg|m4v)$/i.test(url.pathname)) return { type: "media", src: local ? value : url.href };
  } catch { /* Invalid URLs use the existing preview. */ }
  return null;
}
