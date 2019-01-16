"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var store_1 = require("@beef-flux/store");
var todo_1 = require("./todo");
exports.Todo = todo_1.default;
var todo_actions_1 = require("../actions/todo-actions");
var TodoStore = /** @class */ (function (_super) {
    __extends(TodoStore, _super);
    function TodoStore() {
        var _this = _super.call(this) || this;
        _this.state = {
            todos: []
        };
        todo_actions_1.default.__register({
            RECEIVE_TODOS: _this.onReceiveTodos.bind(_this)
        }, _this);
        return _this;
    }
    TodoStore.prototype.sanitizeTodo = function (rawTodo) {
        return new todo_1.default(this.sanitize(rawTodo, todo_1.default.schema));
    };
    TodoStore.prototype.onReceiveTodos = function (rawTodos) {
        var _this = this;
        var nextState = this.nextState();
        rawTodos.forEach(function (rawTodo) {
            var todo = _this.sanitizeTodo(rawTodo);
            _this.upsertItem(nextState.todos, todo.id, todo);
        });
        return nextState;
    };
    return TodoStore;
}(store_1.default.BaseStore));
exports.default = TodoStore;
