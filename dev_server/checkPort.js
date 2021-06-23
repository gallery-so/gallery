const net = require('net');

function checkPort(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once('error', function (err) {
      if (err.code === 'EADDRINUSE') {
        reject(err);
      }
    });

    server.once('listening', function () {
      // if port is not in use, close silently
      server.close();
      resolve();
    });

    server.listen(port);
  });
}

module.exports = checkPort;
