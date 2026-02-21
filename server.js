const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { maxHttpBufferSize: 5e7 });

app.use(express.static(__dirname));

io.on("connection", (socket) => {
    // Сообщение
    socket.on("chat message", (data) => {
        io.emit("chat message", data);
    });

    // Кто-то начал печатать
    socket.on("typing", (name) => {
        socket.broadcast.emit("user typing", name);
    });

    // Кто-то перестал печатать
    socket.on("stop typing", () => {
        socket.broadcast.emit("user stop typing");
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Сервер на порту ${PORT}`));
