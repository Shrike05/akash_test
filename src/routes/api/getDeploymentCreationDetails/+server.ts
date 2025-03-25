import { getDeploymentCreationDetails, loadSDL } from '$lib/create_deployment.js'

export const GET = async ({ request }) => {
    const blockHeight = parseInt(request.headers.get("BLCOKHEIGHT") || "")
    const walletAddress = request.headers.get("WALLETADDRESS")

    const sdl = await loadSDL();

    const deploymentCreationDetails = await getDeploymentCreationDetails(sdl, walletAddress || "", blockHeight);
    return new Response(JSON.stringify(deploymentCreationDetails), {status:200})
}