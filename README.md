# ClamJS
Control a ClamAV daemon over TCP or Unix Domain Sockets.

    var clam = require('clam-js');

    var scanner = clam({port:6666}, null, function () {

      this.version(function (err, version) {
        if (err) {
          console.log(err);
        } else {
          console.log('Now connected to clamd: ' + version);
        }
      });

      this.scan('~/joe/something.zip', function (err, isClean, virusName) {
        if (err) {
          console.log(err);
        } else {
          console.log('State of file: ' + (isClean ? 'clean' : 'infected with'+ virusName));
        }
      });

    });

    scanner.on('close', function (had_error) {
      console.log('Scanner session closed' + (had_error ? ' with error.' : '.'));
    });

    scanner.on('error', function (err) {
      console.log(err);
    });
