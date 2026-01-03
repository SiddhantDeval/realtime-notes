
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/authContext';

const SERVER_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function useSocket() {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (!user?.token) return;

        const newSocket = io(SERVER_URL, {
            auth: {
                token: user.token,
            },
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user?.token]);

    return socket;
}
