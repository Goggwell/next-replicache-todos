import { NextResponse } from 'next/server'
import { serverID, tx } from '@/utils/server/db'
import type { PatchOperation, PullRequestV1, PullResponseV1 } from 'replicache'
import { getLastMutationIDChanges } from '@/lib/actions/pull'

export async function POST(request: Request) {
    const pull: PullRequestV1 = await request.json()
    console.log('Processing pull', JSON.stringify(pull))
    const { clientGroupID } = pull
    const fromVersion = Number(pull.cookie) || 0
    const t0 = Date.now()

    // db.transaction(() => processMutation(push.clientGroupID, mutation))
    // await tx(t => processMutation(t, push.clientGroupID, mutation))

    try {
        await tx(async t => {
            const {version: currentVersion} = await t.one<{version: number}>(
                `
                    SELECT version
                    FROM replicache_server
                    WHERE id = $1
                `, serverID,
            )

            if (fromVersion > currentVersion) {
                throw new Error(`Client version ${fromVersion} is from the future`)
            }

            const lastMutationIDChanges = await getLastMutationIDChanges(t, clientGroupID, fromVersion)

            const changed = await t.manyOrNone<{
                id: string;
                sender: string;
                content: string;
                ord: number;
                version: number;
                deleted: boolean;
            }>(`
                SELECT id, sender, content, ord, version, deleted
                FROM message
                WHERE version > $1
            `, fromVersion)

            // build and return response
            const patch: PatchOperation[] = []
            for (const row of changed) {
                const {id, sender, content, ord, version: rowVersion, deleted} = row
                if (deleted) {
                    if (rowVersion > fromVersion) {
                        patch.push({
                            op: 'del',
                            key: `message/${id}`,
                        })
                    }
                } else {
                    patch.push({
                        op: 'put',
                        key: `message/${id}`,
                        value: {
                            from: sender,
                            content: content,
                            order: ord,
                        }
                    })
                }
            }

            const body: PullResponseV1 = {
                lastMutationIDChanges: lastMutationIDChanges ?? {},
                cookie: currentVersion,
                patch,
            }

            const response = NextResponse.json(body)
            return response
        })
    } catch (error: unknown) {
        console.error((error as Error).message)
        return new Response(JSON.stringify({ message: (error as Error).message }), { status: 500 })
    } finally {
        console.log(`Processed pull in ${Date.now() - t0}ms`)
    }
}