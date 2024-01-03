'use client'

import { Replicache, type WriteTransaction } from "replicache"

export type Message = {
    from: string;
    content: string;
    order: number;
}

export type MessageWithID = Message & {
    id: string;
}

const getReplicache = (): Replicache<{
    createMessage: (tx: WriteTransaction, {
      id, from, content, order,
    }: MessageWithID) => Promise<void> }> | null => {
    const rep = typeof window !== 'undefined'
      ? new Replicache({
        name: 'chat-user-id',
        licenseKey: process.env.REPLICACHE_LICENSE_KEY ?? 'l00000000000000000000000000000001',
        mutators: {
          async createMessage(
            tx: WriteTransaction,
            {
              id, from, content, order,
            }: MessageWithID,
          ) {
            await tx.set(`message/${id}`, {
              from,
              content,
              order,
            })
          },
        },
      })
      : null
  
    return rep
  }

export { getReplicache }
