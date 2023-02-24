const express = require("express");
const http = require("http");
const {Server} = require("socket.io");
module.exports = class WebAPI {
    constructor(port, memory, config) {
        this.config = config

        this.fs = require('fs')

        /*this.options = {
            key: this.fs.readFileSync(this.config["cert-path"] + 'privkey.pem'),
            cert: this.fs.readFileSync(this.config["cert-path"] + 'fullchain.pem')
        }*/

        this.express = require('express')
        this.app = express()
        this.http = require('http')
        this.server = this.http.createServer(this.app)
        this.Server = require("socket.io").Server
        this.io = new this.Server(this.server)

        this.memory = memory

        this.checkServerByClient = () => {}
        this.searchPlayer = () => {}
        this.searchServer = () => {}

        this.port = port

        this.app.get('/', async (req, res) => {
            res.sendFile(__dirname + '/web/index.html')
        }).get('/script.js', async (req, res) => {
            res.sendFile(__dirname + '/web/script.js')
        }).get('/style.css', async (req, res) => {
            res.sendFile(__dirname + '/web/style.css')
        }).get('/query/:serverIp', async (req, res) => {
            var server = req.params.serverIp
            res.send('This feature is in process')
        }).get('/player/:playerName', async (req, res) => {
            var playerName = req.params.playerName
            res.send(this.memory.getPlayerData(playerName))
        }).get('/stop', async (req, res) => {
            res.send('Stopped successfully')
            process.exit()
        })

        this.io.on('connection', (socket) => {
            console.log('A user connected')

            this.memory.connection((array) => {
                for(let i in array) {
                    socket.emit('newServer', array[i])
                }
            })

            socket.on('checkServer', (data) => {
                this.checkServerByClient(data)
            })

            socket.on('getServerOnline', () => {
                socket.emit('serverOnlineNumber', this.memory.getServerOnline())
            })

            socket.on('searchPlayer', (player) => {
                var data = this.searchPlayer(player)

                socket.emit('playerSearchResult', data)
            })

            socket.on('searchServer', (server) => {
                var data = this.searchServer(server)

                socket.emit('serverSearchResult', data)
            })
        })

        this.server.listen(this.port, () => {
            console.log('listening on *:' + this.port)
        })
    }

    applyServer(data) {
        this.io.sockets.emit('newServer', data)
    }
}
