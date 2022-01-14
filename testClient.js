const redis = require('ioredis');

function main() {
    // 6379 vs 9001
    const port = 9001;
    const client = new redis(port);

    client.on('connect', async () => {
        console.log('connected');
        const time = process.hrtime.bigint();

        for (let i = 0; i < 10000; i++) {
            const commands = [];

            commands.push(['sadd', 'cfg.s.test', 'test']);
            commands.push(['get', 'cfg.o.system.adater.admin']);

            await client.multi(commands).exec();
        }

        console.log(port === 6379 ? 'real redis' : 'simulator');
        console.log(process.hrtime.bigint() - time);
    });
}

if (require.main === module) {
    main();
}
