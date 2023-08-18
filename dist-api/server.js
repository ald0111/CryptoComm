"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _ws = _interopRequireDefault(require("ws"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var Server = /*#__PURE__*/function () {
  function Server() {
    _classCallCheck(this, Server);
    this.app = (0, _express["default"])();
    this.wsS = new _ws["default"].Server({
      noServer: true
    });
    this.wsS.on("connection", function (socket) {
      socket.on("message", function (message) {
        return console.log(message);
      });
      //   socket.send("hi");
    });
  }
  _createClass(Server, [{
    key: "listen",
    value: function listen(port) {
      var _this = this;
      var server = this.app.listen(port || 3000);
      server.on("upgrade", function (request, socket, head) {
        _this.wsS.handleUpgrade(request, socket, head, function (sockConn) {
          _this.wsS.emit("connection", socket, request);
        });
      });
    }
  }]);
  return Server;
}();
var _default = Server;
exports["default"] = _default;