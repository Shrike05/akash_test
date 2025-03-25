import { sendManifest } from "$lib/create_deployment";
import { loadSDL } from "$lib/create_deployment";

export const POST = async ({ request }) => {
    const lease = JSON.parse(request.headers.get("LEASE"));
    const certificate = JSON.parse(request.headers.get("CERTIFICATE"));

    const sdl = await loadSDL();

    const result = await sendManifest(sdl, lease, certificate);

    return new Response(JSON.stringify(result), {status:200})
}