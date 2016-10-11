"use strict";
/// <reference path="../../../typings/index.d.ts" />
var TodoStore_1 = require("./TodoStore");
var TodoApi_1 = require("./TodoApi");
var TodoActions_1 = require("./TodoActions");
var AppContainer = (function () {
    function AppContainer() {
        TodoStore_1.TodoStore.listen(this.onUpdate);
    }
    AppContainer.prototype.createTodo = function () {
        TodoActions_1.RECEIVE_TODOS([{
                id: 1,
                name: 'My New Todo'
            }]);
    };
    AppContainer.prototype.saveTodo = function (todo) {
        TodoApi_1.TodoApi.saveTodo(todo);
    };
    AppContainer.prototype.onUpdate = function (newState) {
        console.log('we are updating!');
        TodoApi_1.TodoApi.saveTodo(newState.todos[newState.todos.length - 1]);
    };
    return AppContainer;
}());
var App = new AppContainer();
window['App'] = App;
console.log('starting up our app!');
