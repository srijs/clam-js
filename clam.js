var net = require('net');
var carry = require('carrier').carry;

var Clam = module.exports = function (conn_opts, opts, continuation) {

  var timeout = opts && opts.timeout || 5;

  var alive = false;

  var async_id = 0;
  var async_cb = {};

  var session = net.connect(conn_opts, function () {

    /* Init asynchronous session. */

    session.write('nIDSESSION\n');
    alive = true;

    /* Call the continuation, if given. */

    if (typeof continuation === 'function') {
      continuation.call(this);
    }

  });
  
  /* Register callbacks for line-based reading and
     end, close, error. */

  carry(session, function (line) {
    var match = line.match(/^([0-9]+): (.+)/);
    if (match !== null && typeof async_cb[match[1]] === 'function') {
      setTimeout(function () { async_cb[match[1]](match[2]); }, 0);
    }
  });

  session.on('end', function () {
    alive = false;
  });

  session.on('close', function (had_error) {
    alive = false;
  });

  session.on('error', function (err) {
    //...
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
      _raw('ping');
      setTimeout(ping, timeout * 1000 / 2);
    }
  };

  ping();

  /* Define frontend methods. */

  this.alive = function () {
    return alive;
  };

  this.version = function (cb) {
    _raw('version', null, cb);
  };

  this.scan = function (path, cb) {
    _raw('scan', path, cb);
  };

  return this;

};
