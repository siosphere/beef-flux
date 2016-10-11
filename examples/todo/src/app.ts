/// <reference path="../../../typings/index.d.ts" />
import {TodoStore, TodoState} from "./TodoStore"
import {TodoApi} from "./TodoApi"
import Todo from "./Todo"
import {RECEIVE_TODOS} from "./TodoActions"

class AppContainer {
    
    constructor()
    {
        TodoStore.listen(this.onUpdate);
    }
    
    createTodo() {
        RECEIVE_TODOS([{
            id: 1,
            name: 'My New Todo'
        }]);
    }

    saveTodo(todo : Todo) {
        TodoApi.saveTodo(todo)
    }
    
    onUpdate(newState : TodoState) {
        console.log('we are updating!')
        TodoApi.saveTodo(newState.todos[newState.todos.length - 1])
    }
}

var App = new AppContainer();

window['App'] = App

console.log('starting up our app!')