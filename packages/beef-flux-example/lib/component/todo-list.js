"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var todo_1 = require("./todo");
var TodoList = function (props) {
    return React.createElement("ul", { className: "todo-list" }, props.todos.map(function (todo) {
        return React.createElement(todo_1.default, __assign({ key: todo.id }, todo, { toggle: props.toggle.bind(null, todo) }));
    }));
};
exports.default = TodoList;
