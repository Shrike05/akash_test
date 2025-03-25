import { getLeaseCreationDetails } from '$lib/create_deployment.js'

export const GET = async ({ request }) => {
    const deployment = JSON.parse(request.headers.get("DEPLOYMENT") || "")

    const leaseCreationDetails = await getLeaseCreationDetails(deployment)
    return new Response(JSON.stringify(leaseCreationDetails), {status:200})
}