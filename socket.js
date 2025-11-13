const { Server } = require("socket.io");

let io;

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: "*", // یا آدرس فرانت‌اند
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      },
    });
    console.log("✅ Socket.IO initialized");
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
};
