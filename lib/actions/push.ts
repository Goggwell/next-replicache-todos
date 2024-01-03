'use server'

import { MessageWithID } from "@/lib/constructor"
import { serverID, tx } from "@/utils/server/db"
import { ITask } from "pg-promise"
import { MutationV1 } from "replicache"

export async function getLastMutationID(t: ITask<{}>, clientID: string) {
    const clientRow = await t.oneOrNone(`
        SELECT last_mutation_id
        FROM replicache_client
        WHERE id = $1
    `, clientID,
    )
    if (!clientRow) {
        return 0
    }
    return parseInt(clientRow.last_mutation_id)
}

async function setLastMutationID(t: ITask<{}>, clientID: string, clientGroupID: string, mutationID: number, version: number) {
    await t.none(`
        INSERT INTO replicache_client (id, client_group_id, last_mutation_id, version)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id)
        DO UPDATE SET client_group_id = $2, last_mutation_id = $3, version = $4
    `, [
        clientID,
        clientGroupID,
        mutationID,
        version,
    ])
}

async function createMessage(t: ITask<{}>, { id, from, content, order }: MessageWithID, version: number) {
    await t.none(`
        INSERT INTO message (id, sender, content, ord, deleted, version)
        VALUES ($1, $2, $3, $4, false, $5)
    `, [
        id,
        from,
        content,
        order,
        version,
    ])
}

async function sendPoke() {
    // TODO: send poke to clients
}

async function processMutation(
    t: ITask<{}>,
    clientGroupID: string,
    mutation: MutationV1,
    error?: string | undefined,
) {
    const {clientID} = mutation
    
    const {version: prevVersion} = await t.one(`
        SELECT version
        FROM replicache_server
        WHERE id = $1
        FOR UPDATE
    `, serverID,
    )
    const nextVersion = prevVersion + 1

    const lastMutationID = await getLastMutationID(t, clientID)
    const nextMutationID = lastMutationID + 1

    console.log('nextVersion', nextVersion, 'nextMutationID', nextMutationID)

    // skip mutations that we've already processed
    if (mutation.id < nextMutationID) {
        console.log(`mutation ${mutation.id} already processed, ignoring`)
        return
    }

    // skip mutations that are from the future
    if (mutation.id > nextMutationID) {
        throw new Error(`mutation ${mutation.id} is from the future - aborting`)
    }

    if (error === undefined) {
        console.log(`processing mutation: ${JSON.stringify(mutation)}`)

        // for each possible mutation, run server-side logic to apply it
        switch (mutation.name) {
            case 'createMessage':
                await createMessage(t, mutation.args as MessageWithID, nextVersion)
                break
            default:
                throw new Error(`unknown mutation: ${mutation.name}`)
        }
    } else {
        // TODO: store state here in db to return to clients
        // for additional info on errors
        console.error(`mutation ${JSON.stringify(mutation)} failed: ${error}`)
    }

    console.log('setting', clientID, 'last_mutation_id to', nextMutationID)
    // Update lastMutationID for this client
    await setLastMutationID(t, clientID, clientGroupID, nextMutationID, nextVersion)

    // update global version
    await t.none(`
        UPDATE replicache_server
        SET version = $1
        WHERE id = $2
    `, [
        nextVersion,
        serverID,
    ])
}