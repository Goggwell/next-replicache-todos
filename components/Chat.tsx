'use client'

import { useState, useEffect, FormEvent } from "react"
import { useSubscribe } from "replicache-react"
import { getReplicache, type Message } from "@/lib/constructor"
import { listen } from "@/lib/actions/listen"
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
        {},
      )

    useEffect(() => {
        listen(rep)
    }, []);

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const lastPosition = messages?.length ? messages[messages.length - 1][1].order : 0;
        const order = lastPosition + 1;

        if (rep) {
            rep.mutate.createMessage({
                id: Math.floor(Math.random() * 100).toString(), // nanoid does not play well with unocss
                from: username,
                content,
                order,
            });
            setContent('');
        }
    }

    return (
        <div>
            <form onSubmit={onSubmit}>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Your username" />
                {' '}
                says:
                {' '}
                <input type="text" value={content} onChange={(e) => setContent(e.target.value)} required placeholder="Your message" />
                <input type="submit" />
            </form>
            <MessageList messages={messages} />
        </div>
    )
}

export default Chat