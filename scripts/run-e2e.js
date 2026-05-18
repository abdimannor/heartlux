const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const root = path.resolve(__dirname, '..');
const server = spawn(process.execPath, ['server.js'], {
  cwd: root,
  stdio: ['ignore', 'pipe', 'pipe'],
});

let finished = false;

server.stdout.on('data', chunk => process.stdout.write(chunk));
server.stderr.on('data', chunk => process.stderr.write(chunk));

function waitForServer(url, timeoutMs = 10_000) {
  const started = Date.now();

  return new Promise((resolve, reject) => {
    const tryRequest = () => {
      const req = http.get(url, res => {
        res.resume();
        resolve();
      });

      req.on('error', error => {
        if (Date.now() - started > timeoutMs) {
          reject(error);
          return;
        }
        setTimeout(tryRequest, 150);
      });
    };

    tryRequest();
  });
}

function stopServer() {
  if (!server.killed) server.kill();
}

process.on('exit', stopServer);
process.on('SIGINT', () => {
  stopServer();
  process.exit(130);
});

(async () => {
  try {
    await waitForServer('http://127.0.0.1:8080/');
    const playwrightCli = require.resolve('@playwright/test/cli');
    const testRun = spawn(process.execPath, [playwrightCli, 'test'], {
      cwd: root,
      stdio: 'inherit',
      env: { ...process.env },
    });

    testRun.on('exit', code => {
      finished = true;
      stopServer();
      process.exit(code ?? 1);
    });
  } catch (error) {
    console.error(error.message);
    stopServer();
    process.exit(1);
  }
})();

server.on('exit', code => {
  if (!finished && code !== null && code !== 0) process.exit(code);
});
