const express = require("express")
const http = require("http")
const { Server } = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("public"))

let players = {}

io.on("connection", socket => {

    players[socket.id] = {
        x: 0,
        y: 1.8,
        z: 0,
        name: "Player_" + Math.floor(Math.random()*1000)
    }

    socket.emit("init", { id: socket.id, players })

    socket.broadcast.emit("playerJoined", {
        id: socket.id,
        player: players[socket.id]
    })

    socket.on("move", data => {
        if (!players[socket.id]) return

        players[socket.id].x = data.x
        players[socket.id].y = data.y
        players[socket.id].z = data.z

        socket.broadcast.emit("playerMoved", {
            id: socket.id,
            ...players[socket.id]
        })
    })

    socket.on("disconnect", () => {
        delete players[socket.id]
        io.emit("playerLeft", socket.id)
    })
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log("Running on " + PORT))
