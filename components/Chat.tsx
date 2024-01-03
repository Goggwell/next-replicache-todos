'use client'

import { useState, useEffect } from "react"
import { useSubscribe } from "replicache-react"
import { getReplicache, type Message } from "@/lib/constructor"
import { listen } from "@/lib/actions"
import MessageList from "./MessageList"

const rep = getReplicache()

const Chat = () => {
    const [username, setUsername] = useState<string>('');
    const [content, setContent] = useState<string>('');

    const messages = useSubscribe(
        rep,
        async (tx) => {
          const list = (await tx
            .scan({ prefix: 'message/' })
            .entries()
            .toArray()) as [string, Message][]
          list.sort(([, { order: a }], [, { order: b }]) => a - b)
          return list
        },
        [],
      )

    useEffect(() => {
        listen(rep)
    }, []);

    return (
        <div>
            <form>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Your username" />
                {' '}
                says:
                {' '}
                <input type="text" value={content} onChange={(e) => setContent(e.target.value)} required placeholder="Your message" />
                <input type="submit" />
            </form>
            <MessageList />
        </div>
    )
}

export default Chat