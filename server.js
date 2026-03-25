<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Multiplayer Game</title>

<style>
body{
margin:0;
overflow:hidden;
background:#222;
}

canvas{
background:#111;
display:block;
}
</style>

</head>

<body>

<canvas id="game"></canvas>

<script src="/socket.io/socket.io.js"></script>

<script>

const socket = io()

const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

let players = {}

let myPlayer = {
x:200,
y:200
}

const speed = 4

let keys = {}

document.addEventListener("keydown", e=>{
keys[e.key]=true
})

document.addEventListener("keyup", e=>{
keys[e.key]=false
})

socket.on("currentPlayers", data=>{
players=data
})

socket.on("newPlayer", player=>{
players[player.id]=player
})

socket.on("playerMoved", data=>{
if(players[data.id]){
players[data.id].x=data.x
players[data.id].y=data.y
}
})

socket.on("playerDisconnected", id=>{
delete players[id]
})

function update(){

if(keys["w"]) myPlayer.y-=speed
if(keys["s"]) myPlayer.y+=speed
if(keys["a"]) myPlayer.x-=speed
if(keys["d"]) myPlayer.x+=speed

socket.emit("move", myPlayer)

}

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height)

for(let id in players){

let p=players[id]

ctx.fillStyle="cyan"
ctx.fillRect(p.x,p.y,40,40)

}

ctx.fillStyle="red"
ctx.fillRect(myPlayer.x,myPlayer.y,40,40)

}

function loop(){

update()
draw()

requestAnimationFrame(loop)

}

loop()

</script>

</body>
</html>
