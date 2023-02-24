module.exports = class Checker {
    constructor() {
        this.util = require('minecraft-server-util')

        this.done = async (result) => {
        }

        this.error = async (err) => {
            console.error(err)
        }
    }

    async check(url, port, additional) {
        this.util.status(url, port, {timeout: 3000, enableSRV: true})
            .then((result) => {
                result.more = additional
                result.server = {
                    host: url,
                    port: port
                }
                this.done(result)
            })
            .catch((error) => {
                var res = {
                    code: error,
                    server: {
                        host: url,
                        port: port
                    },
                    additional: additional
                }
                this.error(res)
            })
    }
}