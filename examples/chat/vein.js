(function() {
  var Vein,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = Array.prototype.slice;

  Vein = (function() {

    function Vein(url, options) {
      var _base, _base2, _base3;
      this.url = url != null ? url : location.origin;
      this.options = options != null ? options : {};
      this.getSender = __bind(this.getSender, this);
      this.getListener = __bind(this.getListener, this);
      this.handleSession = __bind(this.handleSession, this);
      this.handleServices = __bind(this.handleServices, this);
      this.handleMessage = __bind(this.handleMessage, this);
      this.handleClose = __bind(this.handleClose, this);
      if ((_base = this.options).prefix == null) _base.prefix = '/vein';
      if ((_base2 = this.options).cookie == null) _base2.cookie = true;
      if ((_base3 = this.options).sessionName == null) {
        _base3.sessionName = 'VSESSID';
      }
      this.socket = new SockJS("" + this.url + this.options.prefix, null, this.options);
      this.callbacks['services'] = this.handleServices;
      this.callbacks['session'] = this.handleSession;
      this.socket.onmessage = this.handleMessage;
      this.socket.onclose = this.handleClose;
      this.session = this.cookie();
      return;
    }

    Vein.prototype.callbacks = {};

    Vein.prototype.subscribe = {};

    Vein.prototype.session = null;

    Vein.prototype.ready = function(cb) {
      return this.callbacks['ready'] = cb;
    };

    Vein.prototype.close = function(cb) {
      return this.callbacks['close'] = cb;
    };

    Vein.prototype.handleClose = function() {
      var _base;
      return typeof (_base = this.callbacks)['close'] === "function" ? _base['close']() : void 0;
    };

    Vein.prototype.handleMessage = function(e) {
      var args, fn, id, keep, service, _i, _len, _ref, _ref2, _ref3;
      _ref = JSON.parse(e.data), id = _ref.id, service = _ref.service, args = _ref.args;
      if (this.subscribe[service] && this.subscribe[service].listeners) {
        _ref2 = this.subscribe[service].listeners;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          fn = _ref2[_i];
          fn.apply(null, args);
        }
      }
      if (!this.callbacks[id]) return;
      keep = (_ref3 = this.callbacks)[id].apply(_ref3, args);
      if (!keep) delete this.callbacks[id];
    };

    Vein.prototype.handleServices = function() {
      var service, services, _base, _i, _j, _len, _len2;
      services = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (_i = 0, _len = services.length; _i < _len; _i++) {
        service = services[_i];
        this[service] = this.getSender(service);
      }
      for (_j = 0, _len2 = services.length; _j < _len2; _j++) {
        service = services[_j];
        this.subscribe[service] = this.getListener(service);
      }
      if (typeof (_base = this.callbacks)['ready'] === "function") {
        _base['ready'](services);
      }
      delete this.callbacks['ready'];
    };

    Vein.prototype.handleSession = function(sess) {
      this.session = sess;
      this.cookie(sess);
      return true;
    };

    Vein.prototype.getListener = function(service) {
      var _this = this;
      return function(cb) {
        var _base;
        if ((_base = _this.subscribe[service]).listeners == null) {
          _base.listeners = [];
        }
        _this.subscribe[service].listeners.push(cb);
      };
    };

    Vein.prototype.getSender = function(service) {
      var _this = this;
      return function() {
        var args, cb, id, _i;
        args = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), cb = arguments[_i++];
        id = _this.getId();
        _this.callbacks[id] = cb;
        _this.socket.send(JSON.stringify({
          id: id,
          service: service,
          args: args,
          session: _this.session
        }));
      };
    };

    Vein.prototype.cookie = function(sess) {
      var cookie, date, expires, name, _i, _len, _ref;
      name = this.options.sessionName;
      if (sess) {
        if (this.options.sessionExpires) {
          if (typeof this.options.sessionExpires === 'number') {
            date = new Date;
            date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
          } else if (this.options.sessionExpires.toUTCString) {
            date = this.options.sessionExpires;
          }
        }
        if (date) expires = ";expires=" + (date.toUTCString());
        return document.cookie = "" + name + "=" + (encodeURIComponent(sess)) + expires;
      } else {
        if (document.cookie && document.cookie.length !== 0) {
          _ref = document.cookie.split(";");
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            cookie = _ref[_i];
            if (cookie.substring(0, name.length + 1) === ("" + name + "=")) {
              return decodeURIComponent(cookie.substring(name.length + 1));
            }
          }
        }
      }
    };

    Vein.prototype.getId = function() {
      var rand;
      rand = function() {
        return (((1 + Math.random()) * 0x10000000) | 0).toString(16);
      };
      return rand() + rand() + rand();
    };

    return Vein;

  })();

  if (typeof define === 'function') {
    define(Vein);
  } else {
    window.Vein = Vein;
  }

}).call(this);