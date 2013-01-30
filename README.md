# ClamJS
Control a ClamAV daemon over TCP or Unix Domain Sockets.

    var clam = require('clam-js');

    var scanner = clam({port:6666}, null, function () {

      this.version(function (v) {
        console.log('Now connected to clamd: ' + v);
      });

      this.scan('~/joe/something.zip', function (result) {
        console.log(result);
      });

    });

    scanner.on('close', function (had_error) {
      console.log('Scanner session closed' + (had_error ? ' with error.' : '.'));
    });

    scanner.on('error' function (err) {
      console.log(err);
    });
