import { sendManifest } from "$lib/create_deployment";
import { loadSDL } from "$lib/create_deployment";
import { SDL } from "@akashnetwork/akashjs/build/sdl/index.js";

export const POST = async ({ request }) => {
    const lease = JSON.parse(request.headers.get("LEASE"));
    const certificate = JSON.parse(request.headers.get("CERTIFICATE"));

    console.log(lease)
    console.log(certificate)

    const { rawSDL, manifestVersion } = await loadSDL();
    const sdl = SDL.fromString(rawSDL, "beta3");

    const result = await sendManifest(sdl, lease, certificate);

    return new Response(JSON.stringify(result), { status: 200 })
}