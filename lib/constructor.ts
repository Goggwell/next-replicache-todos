'use client'

import { Replicache } from "replicache"

const getReplicache = () => {
    const rep = new Replicache({
        name: "chat-rep",
        licenseKey: process.env.REPLICACHE_LICENSE_KEY ?? 'l00000000000000000000000000000001', // replicache tutorial license key
    })

    return rep
}

export { getReplicache }
