import { NextResponse } from "next/server"

export async function POST() {
    try {
        const response = NextResponse.json({})
            return response
        } catch (error: unknown) {
            console.error((error as Error).message)
            return new Response(JSON.stringify({ message: (error as Error).message }), { status: 500 })
    }
}