import { loadSDL } from "$lib/create_deployment";

export const GET = async ({ request }) => {
    const cpu = Number.parseFloat(request.headers.get("CPU_UNITS"));
    const memory = Number.parseFloat(request.headers.get("MEMORY"));
    const storage = Number.parseFloat(request.headers.get("STORAGE"));
    

    const sdl = await loadSDL(cpu, memory, storage);
    

    return new Response(JSON.stringify(sdl), {status:200})
}