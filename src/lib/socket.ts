import { io } from "socket.io-client";

const SOCKET_URL = "https://mujconnect-3lj9.onrender.com";

export const socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
});
