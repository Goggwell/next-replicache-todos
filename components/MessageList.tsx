const MessageList = ({ messages }) => {
    return (
        <>
            {messages?.map(([key, value]) => (
                <div key={key}>
                    <b>
                        {value.from}
                        :
                        {' '}
                    </b>
                    {value.content}
                </div>
            ))}
        </>
    )
}

export default MessageList