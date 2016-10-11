/// <reference path="../../../dist/typings/index.d.ts" />
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var beef = require('beef');
var Todo_1 = require("./Todo");
var TodoActions_1 = require('./TodoActions');
var TodoStoreClass = (function (_super) {
    __extends(TodoStoreClass, _super);
    function TodoStoreClass() {
        _super.call(this);
        this.state = {
            todos: []
        };
        this.receiveTodos = this.receiveTodos.bind(this);
        this.getTodos = this.getTodos.bind(this);
        TodoActions_1.RECEIVE_TODOS.bind(this, 'receiveTodos');
    }
    TodoStoreClass.prototype.getTodos = function () {
        return this.state.todos;
    };
    TodoStoreClass.prototype.receiveTodos = function (rawTodos) {
        var _this = this;
        var newState = this.newState();
        rawTodos.forEach(function (rawTodo) {
            var todo = new Todo_1.default(_this.sanitize(rawTodo, Todo_1.default.schema));
            _this.upsertItem(newState.todos, todo.id, todo);
        });
        return newState;
    };
    return TodoStoreClass;
}(beef.Store));
exports.TodoStoreClass = TodoStoreClass;
var TodoStore = new TodoStoreClass();
exports.TodoStore = TodoStore;
