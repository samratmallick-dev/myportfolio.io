const { spawn } = require('child_process');
const path = require('path');

const targets = [
    { name: 'frontend', dir: path.join(__dirname, 'frontend') },
    { name: 'backend', dir: path.join(__dirname, 'backend') }
];

const processes = [];

const colors = [
    '\x1b[36m',
    '\x1b[32m'
];

targets.forEach((target, index) => {
    const color = colors[index % colors.length];
    const reset = '\x1b[0m';
    const prefix = `${color}[${target.name}]${reset}`;

    console.log(`${prefix} Starting in ${target.dir}...`);

    const child = spawn('npm', ['run', 'dev'], {
        cwd: target.dir,
        shell: true,
        detached: process.platform !== 'win32',
    });

    child.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach((line) => {
            if (line.trim()) {
                console.log(`${prefix} ${line.trim()}`);
            }
        });
    });

    child.stderr.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach((line) => {
            if (line.trim()) {
                console.error(`${prefix} [ERROR] ${line.trim()}`);
            }
        });
    });

    child.on('close', (code) => {
        console.log(`${prefix} Exited with code ${code}`);
    });

    processes.push(child);
});

const cleanup = () => {
    console.log('\nShutting down all processes...');
    processes.forEach((proc) => {
        if (!proc.killed) {
            if (process.platform === 'win32') {
                spawn('taskkill', ['/pid', proc.pid, '/f', '/t'], { shell: true });
            } else {
                try {
                    process.kill(-proc.pid, 'SIGINT');
                } catch (e) {
                    try {
                        proc.kill('SIGINT');
                    } catch (err) {}
                }
            }
        }
    });
    process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
