/// <reference path="../../../dist/typings/index.d.ts" />

import beef = require('beef')
import Todo from "./Todo"

const RECEIVE_TODO = 'RECEIVE_TODO'

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

        this.createTodo = this.createTodo.bind(this)
        this.receiveTodos = this.receiveTodos.bind(this)
        this.getTodos = this.getTodos.bind(this)

    }
    
    public getTodos() : Todo[]
    {
        return this.state.todos
    }

    public createTodo(rawTodo : any)
    {
        this.action(RECEIVE_TODO, [rawTodo])
        //this.receiveTodos([rawTodo])
    }

    @beef.Store.triggerState(RECEIVE_TODO)
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