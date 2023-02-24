const { webhookId, webhookToken } = require('./src/config.json')

const DiscordAPI = require('./src/discord_api.js')
var discordapi = new DiscordAPI(webhookId, webhookToken)
discordapi.startMessage()

const Memory = require('./src/memory.js')
var memory = new Memory(__dirname + '/src/memory', 10000)

var config = require('./config.json')
//config["cert-path"] = __dirname + config["cert-path"]

const WebAPI = require('./src/web.js')
var web = new WebAPI(config.port, memory, config)

web.checkServerByClient = (server) => {
    checker.check(server.split(':')[0], Number(server.split(':')[1]) || 25565, { additional: 'client' })
}

web.searchPlayer = (name) => {
    return memory.searchForPlayer(name)
}

web.searchServer = (text) => {
    return memory.searchForServer(text)
}

const Checker = require('./src/checker.js')

var checker = new Checker()

checker.done = async (result) => {
    console.log(Date.now().toString(), '\t', result.server.host + ':' + result.server.port, '\t', result.motd.clean)

    try {
        //await discordapi.sendServer(result)
    } catch (e) {
        console.log(e)
    }

    web.applyServer(result)
    memory.newServer(result, 1000)

    checkerLoop()
}

checker.error = async (error) => {
    memory.offlineServer(error.server)

    checkerLoop()
}

var i = -1

var checkerLoop = async () => {
    i++

    var x = 0

    if(i > 200000) {
        i = -1
    } else {
        x = i
    }

    if(x % 2 == 0) {
        x = Math.floor(x / 2)
        checker.check((1 + x % 10) + '.tcp.ngrok.io', 10000 + Math.floor(x / 10), { thread: 'main thread' })
    } else {
        x = Math.floor(x / 2)
        checker.check((1 + x % 10) + '.tcp.eu.ngrok.io', 10000 + Math.floor(x / 10), { thread: 'main thread' })
    }
}

for(let n = 0; n < 200; n++) {
    checkerLoop()
}

setInterval(() => {},1000)

