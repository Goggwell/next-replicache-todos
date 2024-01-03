'use client'
import MessageList from "./MessageList"

const Chat = () => {
    return (
        <div>
            <form>
                <input type="text" value="username" required placeholder="Your username" />
                <input type="text" value="username" required placeholder="Your username" />
                <input type="submit" />
            </form>
            <MessageList />
        </div>
    )
}

export default Chat