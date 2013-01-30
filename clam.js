var net          = require('net'),
    EventEmitter = require('events').EventEmitter,
    carry        = require('carrier').carry;

module.exports = function (conn_opts, opts, continuation) {

  var self = new EventEmitter();

  var timeout = opts && opts.timeout || 5;

  var async_id = 0,
      async_cb = {};

  var alive = false;
  
  var session = net.connect(conn_opts, function () {

    /* Init asynchronous session. */

    session.write('nIDSESSION\n');
    alive = true;

    /* Call the continuation, if given. */

    if (typeof continuation === 'function') {
      continuation.call(self);
    }

    ping();

    self.emit('connect');

  });
  
  /* Register callbacks for line-based reading and
     end, close, error. */

  carry(session, function (line) {
    var match = line.match(/^([0-9]+): (.+)/);
    if (match !== null && typeof async_cb[match[1]] === 'function') {
      setTimeout(function () { async_cb[match[1]](match[2]); }, 0);
    }
  });

  session.on('close', function (had_error) {
    alive = false;
    self.emit('close', had_error);
  });

  session.on('error', function (err) {
    self.emit('error', err);
  });

  /* Functions for low-level handling of the session. */

  var _raw = function (cmd, extra, cb) {
    var line = 'n' + cmd.toUpperCase() + (extra ? ' ' + extra : '') + '\n'; 
    async_cb[++async_id] = cb;
    session.write(line);
  };

  var _end = function () {
    session.end('nEND\n');
  };

  /* Ping the session regularly to keep it alive. */

  var ping = function () {
    if (alive) {
      _raw('ping', null, function (pong) {
        self.emit('pong', pong);
      });
      setTimeout(ping, timeout * 1000 / 2);
    }
  };

  /* Define frontend methods. */

  self.alive = function () {
    return alive;
  };

  self.version = function (cb) {
    _raw('version', null, function (data) {
      cb(null, data);
    });
  };

  self.scan = function (path, cb) {
    _raw('scan', path, function (data) {
      var match = data.match(/(OK|FOUND|ERROR)$/);
      switch (match && match[1]) {
        case 'OK':    cb(null, true); break;
        case 'FOUND': cb(null, false); break;
        case 'ERROR': cb(new Error(data)); break;
        default:      cb(new Error('Malformed response.')); break;
      }
    });
  };

  return self;

};
