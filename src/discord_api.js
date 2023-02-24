module.exports = class DiscordAPI {
    constructor(webhookId, webhookToken) {
        this.EmbedBuilder = require('discord.js').EmbedBuilder
        this.WebhookClient = require('discord.js').WebhookClient
        this.AttachmentBuilder = require('discord.js').AttachmentBuilder

        this.webhookClient = new this.WebhookClient({ id: webhookId, token: webhookToken })
    }

    async startMessage() {
        const embed = new this.EmbedBuilder()
            .setTitle('***START***')
            .setTimestamp(Date.now())
            .setColor(0xffffff)

        this.webhookClient.send({
            username: 'SYSTEM',
            avatarURL: 'https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=1,format=auto/https%3A%2F%2F1668102127-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FvBUJ06NRXoKeqkLtTjcm%252Ficon%252FyqbuxLK14fE2ZfBLgkrN%252FPlains_Grass_Block.png%3Falt%3Dmedia%26token%3Dcb7ead5c-cccd-4371-b236-7560c4179fd1',
            embeds: [embed]
        })
    }

    async sendServer(data) {
        const embed = new this.EmbedBuilder()
            .setTitle(data.server.host + ':' + data.server.port)
            .addFields(
                {
                name: 'Online',
                value: data.players.online + '/' + data.players.max
                }
            )
            .setDescription(data.version.name + '\nProtocol: ' + data.version.protocol)
            .setTimestamp(Date.now())
            .setColor(0x66cdaa)

        if(data.motd.clean.length > 0) {
            embed.addFields({
                name: 'MOTD',
                value: '```' + data.motd.clean + '```'
            })
        }

        if(data.players.online > 0 && data.players.sample) {
            var str = ''
            for(let i of data.players.sample) {
                str += i.name + '\n'
            }

            embed.addFields({
                name: 'Players',
                value: str
            })
        }

        if(data.favicon) {
            const imgData = data.favicon.split(',')[1]
            const buf = new Buffer.from(imgData, 'base64')
            const file = new this.AttachmentBuilder(buf).setName('ico.png')

            embed.setImage('attachment://ico.png')

            this.webhookClient.send({
                username: data.more.thread,
                avatarURL: 'https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=1,format=auto/https%3A%2F%2F1668102127-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FvBUJ06NRXoKeqkLtTjcm%252Ficon%252FyqbuxLK14fE2ZfBLgkrN%252FPlains_Grass_Block.png%3Falt%3Dmedia%26token%3Dcb7ead5c-cccd-4371-b236-7560c4179fd1',
                embeds: [embed],
                files: [file]
            })

            return
        }

        this.webhookClient.send({
            username: data.more.thread,
            avatarURL: 'https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=1,format=auto/https%3A%2F%2F1668102127-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FvBUJ06NRXoKeqkLtTjcm%252Ficon%252FyqbuxLK14fE2ZfBLgkrN%252FPlains_Grass_Block.png%3Falt%3Dmedia%26token%3Dcb7ead5c-cccd-4371-b236-7560c4179fd1',
            embeds: [embed],
        })
    }
}