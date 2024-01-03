const MessageList = (messages) => {
    return (
        <>
            {messages.map(([key, value]) => (
                <div key={key}>
                    <b>
                        Name
                        :
                        {' '}
                    </b>
                    Content
                </div>
            ))}
        </>
    )
}

export default MessageList