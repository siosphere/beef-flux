"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var ReactDOM = require("react-dom");
var todo_app_1 = require("./todo-app");
var todo_store_1 = require("./model/todo-store");
ReactDOM.render(React.createElement(todo_app_1.default, null), document.getElementById('app'));
setTimeout(function () {
    todo_store_1.default.seed({ "state": { "todos": [{ "id": "69dbff52-5c37-4093-8cc9-393f775b5c63", "title": "Test", "done": false, "__bID": "69dbff52-5c37-4093-8cc9-393f775b5c63" }] } });
}, 5000);
