const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { maxHttpBufferSize: 1e7 }); // Лимит 10МБ

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

let chatHistory = [];

io.on("connection", (socket) => {
    socket.emit("chat history", chatHistory);

    socket.on("chat message", (data) => {
        chatHistory.push(data);
        if (chatHistory.length > 100) chatHistory.shift();
        io.emit("chat message", data);
    });

    socket.on("typing", (isTyping) => {
        socket.broadcast.emit("user typing", { user: socket.username, typing: isTyping });
    });

    socket.on("set username", (username) => {
        socket.username = username;
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("Чат v4.0 (с файлами) запущен!");
});
