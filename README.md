# ClamJS
Control a ClamAV daemon over TCP or Unix Domain Sockets.

    var clam = require('clam-js');

    var session = clam({port:6666});

    session.version(function (v) {
      console.log('Now connected to clamd: ' + v);
    });

    session.scan('~/joe/something.zip', function (result) {
      console.log(result);
    });
