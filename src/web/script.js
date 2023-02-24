var serverlist = document.getElementById('server-list')

socket.on('newServer', (data) => {
    var playerString = ''
    if(data.players.online > 0 && data.players.sample) {
        for(let i of data.players.sample) {
            playerString += i.name + ' ' + i.id + '\n'
        }
    }

    serverlist.insertAdjacentHTML('afterbegin', `
<div class="server-item" title="${playerString}">
    <span onclick="window.open('/query/${data.server.host}:${data.server.port}')" href="./query/${data.server.host}:${data.server.port}">${data.server.host}:${data.server.port}</span>
    <span class="server-version">${data.version.name}</span>
    <span class="server-desc">${data.motd.html}</span>
    <span class="server-online">${data.players.online}/${data.players.max}</span>
    <img src="${data.favicon}" alt="No ico">
    <span><img class="clipboard" id="${data.server.host}:${data.server.port}" src="https://cdn-icons-png.flaticon.com/512/1621/1621635.png" width="20px" height="20px" onclick="copyServer(this)"></span>
</div>
    `)

    console.log(data)
})

var copyServer = async (server) => {
    try {
        await navigator.clipboard.writeText(server.id)
        console.log('Text or Page URL copied')
    }
    catch (err) {
        console.error('Failed to copy: ', err)
    }
}

var checkServer = (server) => {
    socket.emit('checkServer', server)
}

setInterval(() => {
    socket.emit('getServerOnline')
}, 5000)

socket.on('serverOnlineNumber', (num) => {
    document.title = 'Server Scan: ' + num
})

socket.on('playerSearchResult', (data) => {
    console.log(data)
    var resultDiv = document.getElementById('search-result')
    resultDiv.innerHTML = ''

    if(data.length == 0) {
        resultDiv.insertAdjacentHTML('beforeend', '<p class="error-search">Unable to find any player</p>')
        return
    }

    data.sort((a, b) => {
        return b.onlineCounter - a.onlineCounter
    })

    for(let i of data) {
        resultDiv.insertAdjacentHTML('beforeend', `
<div class="player-result-success" title="Id: ${i.id}">
    <span class="player-name" onclick="window.open('./player/${i.name}')">${i.name}</span>
    <span class="player-activity">Seen ${i.onlineCounter} times</span>
    <span class="player-lastSeen">Last seen: ${new Date(i.lastSeen).toString().split('(')[0]}</span>
</div>
        `)
    }
})

socket.on('serverSearchResult', (data) => {
    console.log(data)
    var resultDiv = document.getElementById('search-result')
    resultDiv.innerHTML = ''

    if(data.length == 0) {
        resultDiv.insertAdjacentHTML('beforeend', '<p class="error-search">Unable to find any server</p>')
        return
    }

    data.sort((a, b) => {
        return b.players.online - a.players.online
    })

    for(let i of data) {
        if(i.offline) continue

        console.log(i)
        var list = ""
        if(i.players.sample) {
            for(let j in i.players.sample) {
                list += i.players.sample[j].name + '<br>'
            }
        }

        var motd = ""
        var skip = 0
        for(let x in i.motd.raw) {
            if(skip > 0) {
                skip--
            } else if(i.motd.raw[x] == '§') {
                skip = 1
            } else {
                motd += i.motd.raw[x]
            }
        }

        resultDiv.insertAdjacentHTML('beforeend', `
<div class="server-result-success online-${!i.offline}">
    <span class="server-info">${i.server.host}:${i.server.port}</span>
    <span class="server-motd">${motd}</span>
    <span class="server-activity">${i.players.online}/${i.players.max}</span>
    <span class="server-players-list">${list}</span>
    <span class="server-version">${i.version.name}</span>
    <span class="server-online">Online: ${!i.offline}</span>
</div>
        `)
    }

    for(let i of data) {
        if(!i.offline) continue

        console.log(i)
        var list = ""
        if(i.players.sample) {
            for(let j in i.players.sample) {
                list += i.players.sample[j].name + '<br>'
            }
        }

        var motd = ""
        var skip = 0
        for(let x in i.motd.raw) {
            if(skip > 0) {
                skip--
            } else if(i.motd.raw[x] == '§') {
                skip = 1
            } else {
                motd += i.motd.raw[x]
            }
        }

        resultDiv.insertAdjacentHTML('beforeend', `
<div class="server-result-success online-${!i.offline}">
    <span class="server-search-info">${i.server.host}:${i.server.port}</span>
    <span class="server-search-motd">${motd}</span>
    <span class="server-search-activity">${i.players.online}/${i.players.max}</span>
    <span class="server-search-players-list">${list}</span>
    <span class="server-search-version">${i.version.name}</span>
    <span class="server-search-online">Online: ${!i.offline}</span>
</div>
        `)
    }
})