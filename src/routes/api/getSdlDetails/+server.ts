import { loadSDL } from "$lib/create_deployment";

export const GET = async ({ request }) => {
    const sdl = await loadSDL();
    

    return new Response(JSON.stringify(sdl), {status:200})
}