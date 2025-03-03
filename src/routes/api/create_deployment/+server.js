import { deploy } from '$lib/create_deployment.js'

export const GET = ({ request }) => {
    const mnemonic = request.headers.get("MNEMONIC")

    const response = deploy(mnemonic || "")
    return new Response(JSON.stringify(response), {status:200})
}