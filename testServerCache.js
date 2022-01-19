const Resp = require('respjs');
const net = require('net');

class RedisHandler {
    constructor(socket) {
        this.multiActive = false;
        this.multiResp = [];
        this.socket = socket;
        this.logScope = '';
        this.resp = new Resp({});
        this.socketId = this.logScope + socket.remoteAddress + ':' + socket.remotePort;

        this.resp.on('error', err => {
            console.log('Error: ' + err);
        });

        this.resp.on('data', data => this._handleCommand(data));

        socket.on('data', data => {
            this.resp.write(data);
        });

        socket.on('error', err => {
            console.log(err);
            if (this.socket) {
                this.socket.destroy();
            }
        });
    }

    _handleCommand(data) {
        const cmd = data[0];
        if (cmd === 'multi') {
            this.multiActive = true;
            return;
        } else if (cmd === 'exec') {
            this.multiActive = false;
            const resps = [];
            for (const _i in this.multiResp) {
                resps.push(Resp.encodeString('OK'));
            }
            this._write(Buffer.concat([Resp.encodeString('OK'), ...resps, Resp.encodeArray(this.multiResp)]));
            this.multiResp = [];
            return;
        }

        if (this.multiActive) {
            this.multiResp.push(Resp.encodeInteger(1));
            return;
        }
        //console.log(data);
        this._write(Resp.encodeInteger(1));
    }

    _write(data) {
        this.socket.write(data);
    }

    close() {
        this.socket.end();
        console.log('close connection');
    }
}

if (require.main === module) {
    this.server = net.createServer();
    this.server.on('error', err => console.error(err));
    this.server.on('connection', socket => {
        new RedisHandler(socket);
    });

    this.server.listen(9001, 'localhost');
}
