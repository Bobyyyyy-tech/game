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
        x: Math.random()*500,
        y: Math.random()*500
    }

    socket.emit("currentPlayers", players)
    socket.broadcast.emit("newPlayer", players[socket.id])

    socket.on("move", data => {
        players[socket.id].x = data.x
        players[socket.id].y = data.y

        io.emit("playerMoved", {
            id: socket.id,
            x: data.x,
            y: data.y
        })
    })

    socket.on("disconnect", () => {
        delete players[socket.id]
        io.emit("playerDisconnected", socket.id)
    })
})

server.listen(3000, () => {
    console.log("Server running on port 3000")
})
