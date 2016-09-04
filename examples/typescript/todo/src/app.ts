import {TodoActions} from "./TodoActions"
import {TodoStore} from "./TodoStore"
import {TodoApi} from "./TodoApi"
import {Todo} from "./Todo"

class AppContainer {
    
    constructor()
    {
        TodoStore.listen('TodoStore.event.UPDATE', this.onUpdate);
    }
    
    createTodo() {
        TodoActions.receiveTodos([{
            name: 'My New Todo'
        }]);
    }

    saveTodo(todo : Todo) {
        TodoApi.saveTodo(todo)
    }
    
    onUpdate() {
        console.log(TodoStore.getTodos())
        TodoApi.saveTodo(TodoStore.getTodos()[TodoStore.getTodos().length - 1])
    }
}


var App = new AppContainer();

window['App'] = App

console.log('starting up our app!')