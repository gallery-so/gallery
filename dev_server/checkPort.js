const net = require('net');

function checkPort(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once('error', error => {
      if (error.code === 'EADDRINUSE') {
        reject(error);
      }
    });

    server.once('listening', () => {
      // If port is not in use, close silently
      server.close();
      resolve();
    });

    server.listen(port);
  });
}

module.exports = checkPort;
