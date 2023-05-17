import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const URL =
  process.env.NODE_ENV === "production"
    ? `http://liargame.lol:${process.env.PORT}`
    : "http://localhost:4000";

export const socket = io(URL, { transports: ["websocket"] });
