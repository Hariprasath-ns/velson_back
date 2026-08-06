import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

let io = null;
const BYPASS = process.env.BYPASS_AUTH === "true";

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    let user = null;

    if (BYPASS) {
      user = { id: 0, email: "admin@admin.com", role: "admin" };
    } else {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
      if (token) {
        try {
          const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;
          user = jwt.verify(cleanToken, process.env.JWT_SECRET);
        } catch (err) {
          socket.emit("error", { message: "Authentication failed" });
          socket.disconnect(true);
          return;
        }
      }
    }

    if (user) {
      socket.user = user;
      
      // Join targeted user-specific room
      socket.join(`user:${user.id}`);
      
      // Join role-specific room
      if (user.role) {
        socket.join(`role:${user.role.toUpperCase()}`);
      }

      console.log(`[Socket] User Connected: ID ${user.id}, Role ${user.role || 'none'}, Socket ID ${socket.id}`);
    } else {
      socket.emit("error", { message: "No token provided" });
      socket.disconnect(true);
    }
  });

  return io;
};

export const getIO = () => {
  return io;
};

export const sendToUserRoom = (userId, event, payload) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, payload);
  }
};

export const sendToRoleRoom = (roleName, event, payload) => {
  if (io && roleName) {
    io.to(`role:${roleName.toUpperCase()}`).emit(event, payload);
  }
};

export const broadcastEvent = (event, payload) => {
  if (io) {
    io.emit(event, payload);
  }
};
