import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/context/authContext'

const SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4001'
export function useSocket() {
    const { token } = useAuth()
    const [socket, setSocket] = useState<Socket | null>(null)

    useEffect(() => {
        if (!token) return
        console.log('Connected to socket')
        const newSocket = io(SERVER_URL, {
            auth: {
                token,
            },
        })

        setSocket(newSocket)

        return () => {
            newSocket.disconnect()
        }
    }, [token])

    return socket
}
