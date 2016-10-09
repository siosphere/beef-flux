/// <reference path="../../../dist/typings/index.d.ts" />

import beef = require('beef')
import Todo from "./Todo"

import {RECEIVE_TODOS} from './TodoActions'

interface TodoState
{
    todos: Todo[]
}

class TodoStoreClass extends beef.Store<TodoState>
{
    constructor()
    {
        super();

        this.state = {
            todos: []
        }

        this.receiveTodos = this.receiveTodos.bind(this)
        this.getTodos = this.getTodos.bind(this)

        RECEIVE_TODOS.bind(this, 'receiveTodos')

    }
    
    public getTodos() : Todo[]
    {
        return this.state.todos
    }

    protected receiveTodos(rawTodos : any[]) {
        let newState = this.newState()

        rawTodos.forEach((rawTodo : any) => {
            var todo : any = new Todo(this.sanitize(rawTodo, Todo.schema));
            this.upsertItem(newState.todos, todo.id, todo);
        })

        return newState
    }
}

const TodoStore = new TodoStoreClass();


export {
    TodoStoreClass,
    TodoStore,
    TodoState
}