import http from "node:http";
import app from "./app.js";
import { createWebSocketServer } from "./websocket/websocket.server.js";

const PORT = 5000;

const server = http.createServer(app);

createWebSocketServer(server);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});