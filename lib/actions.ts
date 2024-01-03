import Pusher from "pusher-js";
import { Replicache, type WriteTransaction } from "replicache";
import { MessageWithID } from "./constructor";

export const listen = (rep: Replicache<{ createMessage: (tx: WriteTransaction, { id, from, content, order, }: MessageWithID) => Promise<void> }> | null) => {
    if (rep === null) {
        return;
    }

    console.log('listening for changes')
    Pusher.logToConsole = true;
    const pusher = new Pusher('app-key', {
        cluster: '',
        wsHost: '127.0.0.1',
        wsPort: 6001,
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
    })
    const channel = pusher.subscribe('default-channel')
    channel.bind('poke-event', () => {
        console.log('poked!')
        rep.pull()
    })
}