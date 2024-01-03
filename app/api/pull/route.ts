import { NextResponse } from 'next/server'

export async function POST() {
    try {
        const response = NextResponse.json({
            lastMutationIDChanges: {},
            cookie: 42,
            patch: [
                { op: 'clear' },
                {
                    op: 'put',
                    key: 'message/1',
                    value: {
                        from: 'me',
                        content: 'hello',
                        order: 1,
                    },
                },
                {
                    op: 'put',
                    key: 'message/2',
                    value: {
                        from: 'you',
                        content: 'world',
                        order: 2,
                    },
                },
            ]
        })
        return response
    } catch (error: unknown) {
        console.error((error as Error).message)
        return new Response(JSON.stringify({ message: (error as Error).message }), { status: 500 })
    }
}