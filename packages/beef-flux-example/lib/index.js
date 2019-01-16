"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var ReactDOM = require("react-dom");
var todo_app_1 = require("./todo-app");
var store_1 = require("@beef-flux/store");
var MyManager = new store_1.ContextManager();
ReactDOM.render(React.createElement(store_1.default.Context.Provider, { value: MyManager },
    React.createElement(todo_app_1.default, null)), document.getElementById('app'));
MyManager.seed();
var MyManager2 = new store_1.ContextManager();
ReactDOM.render(React.createElement(store_1.default.Context.Provider, { value: MyManager2 },
    React.createElement(todo_app_1.default, null)), document.getElementById('app2'));
setTimeout(function () {
    MyManager.seed({ "todoStore": { "state": { "todos": [{ "id": "69dbff52-5c37-4093-8cc9-393f775b5c63", "title": "Test", "done": false, "__bID": "69dbff52-5c37-4093-8cc9-393f775b5c63" }] } } });
}, 5000);
