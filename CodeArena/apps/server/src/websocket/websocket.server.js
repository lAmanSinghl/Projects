import { WebSocketServer } from "ws";
import { startRedisSubscriber } from "./redisSubscriber.js";
import { verifyAccessToken } from "../utils/jwt.js";

const userSockets = new Map();

export const createWebSocketServer = (server) => {
    const wss = new WebSocketServer({
        server
    });

    wss.on("connection", (ws) => {
        console.log("WebSocket client connected");

        ws.isAuthenticated = false;

        ws.send(
            JSON.stringify({
                type: "CONNECTED",
                message: "WebSocket connection established"
            })
        );

        ws.on("message", (data) => {
            try {
                const message = JSON.parse(data.toString());

                // Ignore AUTH messages after authentication
                if (message.type === "AUTH" && ws.isAuthenticated) {
                    return;
                }

                // We currently only handle AUTH messages
                if (message.type !== "AUTH") {
                    return;
                }

                // Verify the access token
                const decoded = verifyAccessToken(message.token);

                // Store authenticated user's information on the socket
                ws.userId = decoded.sub;
                ws.isAuthenticated = true;

                // Create a socket set for this user if it doesn't exist
                if (!userSockets.has(ws.userId)) {
                    userSockets.set(ws.userId, new Set());
                }

                // Add this socket to the user's sockets
                userSockets.get(ws.userId).add(ws);

                console.log(
                    `User ${ws.userId} has ${userSockets.get(ws.userId).size} socket(s)`
                );

                // Tell the client authentication succeeded
                ws.send(
                    JSON.stringify({
                        type: "AUTH_SUCCESS"
                    })
                );

            } catch (error) {
                console.error("WebSocket authentication failed");

                ws.send(
                    JSON.stringify({
                        type: "AUTH_ERROR",
                        message: "Invalid or expired token"
                    })
                );

                ws.close();
            }
        });

        ws.on("close", () => {
            if (ws.userId) {
                const sockets = userSockets.get(ws.userId);

                if (sockets) {
                    sockets.delete(ws);

                    if (sockets.size === 0) {
                        userSockets.delete(ws.userId);
                    }
                }
            }

            console.log("WebSocket client disconnected");
        });

        ws.on("error", (error) => {
            console.error("WebSocket error:", error);
        });
    });

startRedisSubscriber((event) => {
    const sockets = userSockets.get(event.userId?.toString());

    if (!sockets) {
        return;
    }

    for (const ws of sockets) {
        if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify(event));
        }
    }
});

    return wss;
};