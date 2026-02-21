const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const dns = require('dns');

// Лечим DNS ошибки
dns.setDefaultResultOrder('ipv4first');

// ИЗМЕНЕННАЯ ССЫЛКА (более надежная для некоторых провайдеров)
const MONGO_URI = "mongodb://axmedsultanovpc_db_user:aT3WtovcOl5XuXsl@ac-p5v8gty-shard-00-00.t5z3z3a.mongodb.net:27017,ac-p5v8gty-shard-00-01.t5z3z3a.mongodb.net:27017,ac-p5v8gty-shard-00-02.t5z3z3a.mongodb.net:27017/megachat?ssl=true&replicaSet=atlas-13p68n-shard-0&authSource=admin&retryWrites=true&w=majority";

cloudinary.config({ 
  cloud_name: 'dx57brrqt', 
  api_key: '959236217462211', 
  api_secret: '1YUz1NOF06AIpHw1-Xzd6NpTNGE' 
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, { maxHttpBufferSize: 2e7, cors: { origin: "*" } });

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ ПОБЕДА! БАЗА ПОДКЛЮЧЕНА!"))
    .catch(err => {
        console.error("❌ ВСЁ ЕЩЁ ОШИБКА:");
        console.error(err.message);
    });

const Msg = mongoose.model("Msg", new mongoose.Schema({
    user: String, text: String, fileUrl: String, fileName: String, date: { type: Date, default: Date.now }
}));

app.use(express.static(__dirname));
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

io.on("connection", async (socket) => {
    try {
        const history = await Msg.find().sort({ date: -1 }).limit(50);
        socket.emit("chat history", history.reverse());
    } catch (e) { console.log(e); }

    socket.on("chat message", async (data) => {
        let savedData = { user: data.user, text: data.text, fileUrl: "", fileName: data.fileName || "" };
        if (data.file) {
            try {
                const res = await cloudinary.uploader.upload(data.file, { resource_type: "auto", folder: "megachat" });
                savedData.fileUrl = res.secure_url;
            } catch (e) { console.error(e); }
        }
        await new Msg(savedData).save();
        io.emit("chat message", savedData);
    });
    socket.on("set username", (u) => { socket.username = u; });
});

server.listen(process.env.PORT || 3000, () => console.log(`🚀 Сервер готов на http://localhost:3000`));
