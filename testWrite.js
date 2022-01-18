const Resp = require('respjs');
const N_ITER = 1000000; //1000000;

const resp = new Resp({});

const wait = ms => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
};

resp.on('error', err => {
    console.error(`Err: ${err}`);
});

let counter = 0;
let runSingle = true;

resp.on('data', async data => {
    counter++;
    if (counter === N_ITER * 4) {
        counter = 0;
        console.log(process.hrtime.bigint() - time);
        if (runSingle) {
            runSingle = false;
            await wait(50);
            time = process.hrtime.bigint();
            testSingle();
        }
    }
});

const MULTI_WRITE = Buffer.from(
    '*1\r\n$5\r\nmulti\r\n*3\r\n$4\r\nsadd\r\n$10\r\ncfg.s.test\r\n$4\r\ntest\r\n*2\r\n$3\r\nget\r\n$25\r\ncfg.o.system.adater.admin\r\n*1\r\n$4\r\nexec\r\n'
);

const SINGLE_WRITE = Buffer.from('*3\r\n$3\r\nset\r\n$25\r\ncfg.o.system.adater.admin\r\n$2\r\n{}\r\n');

let time = process.hrtime.bigint();
testMulti();

function testMulti() {
    console.log('run multi');
    for (let i = 0; i < N_ITER; i++) {
        resp.write(MULTI_WRITE);
    }
    console.log('finished multi');
}

function testSingle() {
    console.log('run single');
    for (let i = 0; i < N_ITER; i++) {
        resp.write(SINGLE_WRITE);
        resp.write(SINGLE_WRITE);
        resp.write(SINGLE_WRITE);
        resp.write(SINGLE_WRITE);
    }
    console.log('finished single');
}
