"use strict";

var _server = _interopRequireDefault(require("./server.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var server = new _server["default"]();
console.log("Listening on port 3333");
server.listen(3333);