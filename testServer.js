const Resp = require('respjs');
const net = require('net');

class RedisHandler {
    constructor(socket) {
        this.socket = socket;
        this.logScope = '';
        this.resp = new Resp({});
        this.socketId = this.logScope + socket.remoteAddress + ':' + socket.remotePort;

        this.resp.on('error', err => {
            console.error(`${this.socketId} (Init=${this.initialized}) Redis error:${err}`);
            if (this.initialized) {
                this.sendError(null, new Error(`PARSER ERROR ${err}`)); // TODO
            } else {
                this.close();
            }
        });

        this.resp.on('data', data => this._handleCommand(data));

        socket.on('data', data => {
            this.resp.write(data);
        });

        socket.on('error', err => {
            console.debug(`${this.socketId} Redis Socket error: ${err}`);
            if (this.socket) {
                this.socket.destroy();
            }
        });
    }

    _handleCommand(data) {
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
    this.server.on('error', err => console.error(`Error inMem-objects listening on port: ${err}`));
    this.server.on('connection', socket => {
        new RedisHandler(socket);
    });

    this.server.listen(9001, 'localhost');
}
