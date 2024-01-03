'use server'

import { ITask } from "pg-promise";

export async function getLastMutationIDChanges(
    t: ITask<{}>,
    clientGroupID: string,
    fromVersion: number,
) {
    const rows = await t.manyOrNone<{id: string; last_mutation_id: number}>(
        `
            SELECT id, last_mutation_id
            FROM replicache_client
            WHERE client_group_id = $1 and version > $2
        `, [clientGroupID, fromVersion],
    )
    return Object.fromEntries(rows.map(r => [r.id, r.last_mutation_id]))
}