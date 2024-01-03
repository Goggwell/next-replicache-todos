'use client'

import { Replicache, type WriteTransaction } from "replicache"

interface IMessage {
    id: string;
    from: string;
    content: string;
    order: number;
}

const getReplicache = (): Replicache<{
    createMessage: (tx: WriteTransaction, {
        id, from, content, order,
    }: IMessage) => Promise<void> }> | null => {
    const rep = typeof window !== 'undefined' ? 
        new Replicache({
            name: "chat-rep",
            licenseKey: process.env.REPLICACHE_LICENSE_KEY ?? 'l00000000000000000000000000000001', // replicache tutorial license key
            mutators: {
                async createMessage(
                    tx: WriteTransaction,
                    {
                        id, from, content, order,
                    }: IMessage,
                ) {
                    await tx.set(`message/${id}`, {
                        from, content, order,
                    })
                }
            }
        })
        : null

    return rep
}

export { getReplicache }
