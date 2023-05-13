import cookieParser from "cookie-parser";
import cors from "cors";
import * as dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import createError from "http-errors";
import morganLogger from "morgan";
import { ErrorHandler } from "./middleware/error-handler";
import { apiRateLimiter } from "./middleware/rate-limiter";
import usersRouter from "./routes/user.route";

// for socket io
import http from "http";
import { Server } from "socket.io";

import { logger } from "./utils/logger";
import { SocketActions } from "./utils/socket";
import { checkJwt } from "./middleware/auth0";

dotenv.config();
const app = express();

app.use(helmet());
app.use(cors({ origin: "http://localhost:3000" }));
app.use(cookieParser());
app.use(express.json());
app.use(morganLogger("dev"));

// Socket io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

interface UserSocketMap {
    [key: string]: string;
}

interface UserCursorMap {
    [key: string]: { userName: string; cursorPosition: { lineNumber: number; column: number } };
}

// TODO use cache storage
const userSocketMap: UserSocketMap = {};
const userCursorMap: UserCursorMap = {};

const getAllConnectedClients = (sessionId: string) => {
    return Array.from(io.sockets.adapter.rooms.get(sessionId) || []).map((socketId) => {
        return {
            socketId,
            userName: userSocketMap[socketId],
        };
    });
};

io.on("connection", (socket) => {
    socket.on(SocketActions.JOIN, ({ sessionId, userName }) => {
        userSocketMap[socket.id] = userName;
        socket.join(sessionId);
        const clients = getAllConnectedClients(sessionId);
        const cursorPositionsForSessionId = Object.keys(userCursorMap).reduce((acc, socketId) => {
            const { userName, cursorPosition } = userCursorMap[socketId];
            acc[userName] = { userName, cursorPosition };
            return acc;
        }, {} as UserCursorMap);

        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(SocketActions.JOINED, {
                clients,
                userName,
                socketId: socket.id,
                cursorPositionsForSessionId,
            });
        });
    });

    socket.on(SocketActions.CURSOR_POSITION_CHANGED, ({ sessionId, cursorPosition, userName }) => {
        userCursorMap[socket.id] = { userName, cursorPosition };
        console.log(userName, cursorPosition);

        const clients = getAllConnectedClients(sessionId);
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(SocketActions.CURSOR_POSITION_CHANGED, { cursorPosition, userName });
        });
    });

    socket.on(SocketActions.CODE_CHANGED, ({ sessionId, code }) => {
        socket.in(sessionId).emit(SocketActions.CODE_CHANGED, { code });
    });

    socket.on(SocketActions.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(SocketActions.CODE_CHANGED, { code });
    });

    socket.on("disconnecting", () => {
        const rooms = [...socket.rooms];
        rooms.forEach((sessionId) => {
            socket
                .in(sessionId)
                .emit(SocketActions.DISCONNECTED, { socketId: socket.id, userName: userSocketMap[socket.id] });
        });
        delete userSocketMap[socket.id];
        delete userCursorMap[socket.id];
        socket.leave(rooms[0]);
    });
});

app.use("/api", apiRateLimiter);


// Routes
app.use("/api/user", usersRouter);
app.use(ErrorHandler);

// Catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
    next(createError(404));
});
process.on("unhandledRejection", (error: Error) => {
    logger.error("unhandledRejection", error);
    throw error;
});

// handle uncaught exception
process.on("uncaughtException", (error: Error) => {
    console.log(error);
    logger.error("uncaughtException", error);
});
const PORT: number = parseInt(process.env.PORT as string, 10) || 4000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
