const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = {};
let world = {};

function key(x, y, z) {
    return `${x},${y},${z}`;
}

// generate terrain
for (let x = -20; x < 20; x++) {
    for (let z = -20; z < 20; z++) {
        let h = Math.floor(Math.sin(x * 0.2) * 2 + Math.cos(z * 0.2) * 2 + 5);
        for (let y = 0; y < h; y++) {
            world[key(x, y, z)] = y === h - 1 ? 1 : 2;
        }
    }
}

io.on("connection", (socket) => {

    players[socket.id] = { x: 0, y: 10, z: 0 };

    socket.emit("init", {
        id: socket.id,
        players,
        world
    });

    socket.broadcast.emit("playerJoined", {
        id: socket.id,
        player: players[socket.id]
    });

    socket.on("move", (data) => {
        players[socket.id] = data;

        socket.broadcast.emit("playerMoved", {
            id: socket.id,
            ...data
        });
    });

    socket.on("blockUpdate", (data) => {
        const k = key(data.x, data.y, data.z);

        if (data.type === 0) delete world[k];
        else world[k] = data.type;

        io.emit("blockUpdate", data);
    });

    socket.on("disconnect", () => {
        delete players[socket.id];
        io.emit("playerLeft", socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
