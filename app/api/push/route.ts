import { NextResponse } from "next/server"
import type { MutationV1, PushRequestV1 } from "replicache"
import { serverID, tx } from "@/utils/server/db"
import { processMutation, sendPoke } from "@/lib/actions/push"

export async function POST(request: Request) {
    let t0: number = 0
    try {
        const push: PushRequestV1 = await request.json()
        console.log('Processing push', JSON.stringify(push))
        t0 = Date.now()

        for (const mutation of push.mutations) {
            const t1 = Date.now()

            try {
                await tx(t => processMutation(t, push.clientGroupID, mutation))
            } catch (error) {
                if (error instanceof Error) {
                    const errorMessage = error.message
                    await tx(t => processMutation(t, push.clientGroupID, mutation, errorMessage))
                }
            }
            console.log(`Processed mutation ${mutation.id} in ${Date.now() - t1}ms`)
        }
        
        await sendPoke()

        const response = NextResponse.json({})
        return response
    } catch (error: unknown) {
        console.error((error as Error).message)
        return new Response(JSON.stringify({ message: (error as Error).message }), { status: 500 })
    } finally {
        console.log(`Processed push in ${Date.now() - t0}ms`)
    }
}