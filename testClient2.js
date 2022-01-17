const { createClient } = require('@node-redis/client');

async function main() {
    // 6379 vs 9001
    const port = 9001;
    const client = createClient({ url: `redis://localhost:${port}` });
    const N_ITER = 10000;

    await client.connect();

    console.log('connected');
    let time = process.hrtime.bigint();

    for (let i = 0; i < N_ITER; i++) {
        await client.multi().sAdd('cfg.s.test', 'test').get('cfg.o.system.adapter.admin').exec();
    }

    console.log('finished multi/exec');
    console.log(port === 6379 ? 'real redis' : 'simulator');
    console.log(process.hrtime.bigint() - time);

    console.log('run await');
    time = process.hrtime.bigint();

    for (let i = 0; i < N_ITER; i++) {
        const commands = [];

        commands.push(['sAdd', 'cfg.s.test', 'test']);
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
}

if (require.main === module) {
    main();
}
