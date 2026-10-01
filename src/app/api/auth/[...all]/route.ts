import { getAuth } from "@/lib/auth";
async function handle(request: Request) {
  // Provider tokens are only retrieved through the server API, never a browser endpoint.
  try {
    const path = decodeURIComponent(new URL(request.url).pathname);
    if (/\/(get-access-token|refresh-token)\/?$/.test(path)) return Response.json({ message: "Not available." }, { status: 404 });
    return await getAuth().handler(request);
  }
  catch { return Response.json({ message: "Authentication is temporarily unavailable." }, { status: 503 }); }
}
export const GET = handle;
export const POST = handle;
