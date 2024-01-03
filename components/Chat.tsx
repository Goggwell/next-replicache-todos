'use client'

import { useState } from "react"
import MessageList from "./MessageList"

const Chat = () => {
    const [username, setUsername] = useState<string>('');
    const [content, setContent] = useState<string>('');

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