import { newDb } from "pg-mem"
import pgp, { IDatabase, ITask, as, txMode } from "pg-promise"

const { isolationLevel } = pgp.txMode

export const serverID = 1

async function initDB() {
    console.info('initializing database...')
    const db = newDb().adapters.createPgPromise()
    await tx(async (t) => {
        // global versioning (will replace with row versioning later)
        await t.none(`
            CREATE TABLE IF NOT EXISTS replicache_server (
                id INTEGER PRIMARY KEY NOT NULL,
                version INTEGER
            )
        `)
        await t.none(`
            INSERT INTO replicache_server (id, version)
            values ($1, 1)
        `, serverID)

        // store chat messages
        await t.none(`
            CREATE TABLE IF NOT EXISTS message (
                id TEXT PRIMARY KEY NOT NULL,
                sender VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                ord INTEGER NOT NULL,
                deleted BOOLEAN NOT NULL DEFAULT FALSE,
                version INTEGER NOT NULL DEFAULT 0
            )
        `)

        // stores last mutationID processed for each Replicache client
        await t.none(`
            CREATE TABLE IF NOT EXISTS replicache_client (
                id VARCHAR(36) PRIMARY KEY NOT NULL,
                client_group_id VARCHAR(36) NOT NULL,
                last_mutation_id INTEGER NOT NULL DEFAULT 0,
                version INTEGER NOT NULL DEFAULT 0
            )
        `)
    }, db)
    return db
}

declare global {
    // eslint-disable-next-line no-var
    var __db: IDatabase<object> | undefined
}

async function getDB() {
    // cache db in Node global so it survives HMR
    if (!global.__db) {
        global.__db = (await initDB()) as unknown as IDatabase<object>
    }
    return global.__db as IDatabase<object>
}

// helper function for accessing the database at serializable isolation level
export async function tx<R>(
    f: (t: ITask<object> & object) => Promise<R>,
    dbp = getDB()
) {
    const db = await dbp
    return await db.tx(
        {
            mode: new txMode.TransactionMode({
                tiLevel: isolationLevel.serializable,
            }),
        },
        f
    )
}