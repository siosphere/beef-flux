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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var store_1 = require("@beef-flux/store");
// # Actions
var todo_actions_1 = require("./actions/todo-actions");
// # Components
var todo_list_1 = require("./component/todo-list");
var create_todo_1 = require("./component/create-todo");
// # Model
var todo_store_1 = require("./model/todo-store");
var TodoApp = /** @class */ (function (_super) {
    __extends(TodoApp, _super);
    function TodoApp(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            todos: props.todoStore.getState().todos
        };
        return _this;
    }
    TodoApp_1 = TodoApp;
    TodoApp.prototype.render = function () {
        var _this = this;
        return React.createElement("div", null,
            React.createElement(todo_list_1.default, { todos: this.state.todos, toggle: function (todo) {
                    todo.done = !todo.done;
                    todo_actions_1.default.RECEIVE_TODOS([todo]);
                } }),
            React.createElement(create_todo_1.default, null),
            React.createElement("div", { onClick: function () {
                    console.log(_this.props.todoStore.dump());
                } }, "Hey"));
    };
    TodoApp.onTodoAppUpdate = function (componentState, nextStoreState, oldStoreState) {
        return {
            todos: nextStoreState.todos
        };
    };
    var TodoApp_1;
    TodoApp.contextType = store_1.default.Context;
    TodoApp = TodoApp_1 = __decorate([
        todo_store_1.default.bind("todoStore"),
        store_1.default.subscribe({
            "todoStore": TodoApp_1.onTodoAppUpdate
        })
    ], TodoApp);
    return TodoApp;
}(React.Component));
exports.default = TodoApp;
