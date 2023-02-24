module.exports = class Memory {
    constructor(path, timeout) {
        this.path = path

        this.serverData = require(path + '/serverData.json')
        this.playerData = require(path + '/playerData.json')

        var logsDataFiles = require('fs').readdirSync(path + '/checkLogs/')
        this.logsName = logsDataFiles[logsDataFiles.length - 1]

        this.maxLogsLength = 5242880
        console.log('Loading logs from ' + this.logsName)

        this.logsData = require(path + '/checkLogs/' + this.logsName)

        this.session = []
        this.onlineServerCounter = {}

        for(let i in this.serverData) {
            if(!this.serverData[i].offline) {
                this.onlineServerCounter[this.serverData[i].server.host + ':' + this.serverData[i].server.port] = true
            }
        }

        this.fs = require('fs')

        this.changed = true

        setInterval(() => {
            if(!this.changed) return

            this.fs.writeFileSync(this.path + '/serverData.json', JSON.stringify(this.serverData), () => {})
            this.fs.writeFileSync(this.path + '/playerData.json', JSON.stringify(this.playerData), () => {})
            this.fs.writeFileSync(this.path + '/checkLogs/' + this.logsName, JSON.stringify(this.logsData), () => {})
        }, timeout)
    }

    saveLogs(data) {
        this.logsData.push(data)

        if(JSON.stringify(this.logsData).length > this.maxLogsLength) {
            console.log('Creating new file')

            this.fs.writeFileSync(this.path + '/checkLogs/' + this.logsName, JSON.stringify(this.logsData), () => {})

            this.logsName = 'data_' + (Number(this.logsName.split('_')[1].split('.')[0]) + 1) + '.json'

            this.logsData = []
        }

        console.log(JSON.stringify(this.logsData).length)
    }

    newServer(data) {
        data.timestamp = Date.now()

        this.onlineServerCounter[data.server.host + ':' + data.server.port] = true

        this.session.push(JSON.parse(JSON.stringify(data)))

        if(this.session.length > 30) this.session.shift()

        delete data.favicon
        delete data.motd.html
        delete data.motd.clean

        this.saveLogs(data)

        //this.checkLogs.push(data)

        if(data.players.online > 0 && data.players.sample) {
            for(let i of data.players.sample) {
                if(i.id == '00000000-0000-0000-0000-000000000000') continue
                if(!this.playerData[i.id]) {
                    this.playerData[i.id] = {
                        name: i.name,
                        onlineCounter: 0,
                        id: i.id,
                        lastSeen: Date.now(),
                        servers: {},
                        playedWith: {}
                    }
                }

                if(!this.playerData[i.id].servers) {
                    if(this.playerData[i.id].onlineCounter > 0) {
                        this.playerData[i.id].servers = {}
                        this.playerData[i.id].servers['old_data'] = {
                            lastSeen: this.playerData[i.id].lastSeen,
                            times: this.playerData[i.id].onlineCounter
                        }
                    }
                }

                if(!this.playerData[i.id].playedWith) {
                    this.playerData[i.id].playedWith = {}
                }

                if(!this.playerData[i.id].servers[data.server.host + ':' + data.server.port]) {
                    this.playerData[i.id].servers[data.server.host + ':' + data.server.port] = {
                        lastSeen: 0,
                        times: 0
                    }
                }

                for(let j of data.players.sample) {
                    if(i == j) continue

                    if(!this.playerData[i.id].playedWith[j.name]) {
                        this.playerData[i.id].playedWith[j.name] = 0
                    }

                    this.playerData[i.id].playedWith[j.name]++
                }

                this.playerData[i.id].servers[data.server.host + ':' + data.server.port].lastSeen = Date.now()
                this.playerData[i.id].servers[data.server.host + ':' + data.server.port].times += 1

                this.playerData[i.id].onlineCounter++
                this.playerData[i.id].lastSeen = Date.now()
            }
        }

        this.serverData[data.server.host + ':' + data.server.port] = data
    }

    async offlineServer(server) {
        if(this.serverData[server.host + ':' + server.port]) {
            this.serverData[server.host + ':' + server.port].offline = true
        }

        if(this.onlineServerCounter[server.host + ':' + server.port]) {
            delete this.onlineServerCounter[server.host + ':' + server.port]
        }
    }

    searchForPlayer(name) {
        name = name.toLowerCase()
        var result = []

        for(let i in this.playerData) {
            if(this.playerData[i].name.toLowerCase().includes(name)) result.push(this.playerData[i])
        }

        return result
    }

    searchForServer(text) {
        text = text.toLowerCase()
        var result = []

        for(let i in this.serverData) {
            if(this.serverData[i].motd.raw.toLowerCase().includes(text)) result.push(this.serverData[i])
        }

        return result
    }

    connection(callback) {
        callback(this.session)
    }

    getPlayerData(player) {
        for(let i in this.playerData) {
            if(this.playerData[i].name == player) return this.playerData[i]
        }
    }

    getServerOnline() {
        return Object.keys(this.onlineServerCounter).length
    }
}