const redis = require('ioredis');
// 1625 - 2000 für einzelnes write = 8k für 4
// 3667n - 12250n für einzelnes Write, häufig 122453n für 4

function main() {
    // 6379 vs 9001
    const port = 9001;
    const client = new redis(port);
    const N_ITER = 10000;

    client.on('connect', async () => {
        console.log('connected');
        let time = process.hrtime.bigint();

        for (let i = 0; i < N_ITER; i++) {
            const commands = [];

            commands.push(['sadd', 'cfg.s.test', 'test']);
            commands.push(['get', 'cfg.o.system.adater.admin']);

            await client.multi(commands).exec();
        }

        console.log('finished multi/exec');
        console.log(port === 6379 ? 'real redis' : 'simulator');
        console.log(process.hrtime.bigint() - time);
        console.log('run await');
        time = process.hrtime.bigint();

        for (let i = 0; i < N_ITER; i++) {
            const commands = [];

            commands.push(['sadd', 'cfg.s.test', 'test']);
            commands.push(['get', 'cfg.o.system.adater.admin']);

            // also make 4 commands like multi exec
            for (const command of commands) {
                const cmd = command.shift();
                await client[cmd](...command);
                await client[cmd](...command);
            }
        }

        console.log('finished await');
        console.log(port === 6379 ? 'real redis' : 'simulator');
        console.log(process.hrtime.bigint() - time);
    });
}

if (require.main === module) {
    main();
}
