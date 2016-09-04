/// <reference path="../../../../dist/typings/index.d.ts" />

import beef = require('beef')


import {Todo} from "./Todo"

import {TodoActions} from "./TodoActions"

class TodoStoreClass extends beef.Store
{
    constructor()
    {
        super();

        TodoActions._register({
            receiveTodos: TodoActions.receiveTodos
        }, this);

    }
    
    public getTodos() : Todo[]
    {
        return this.getRows('todo');
    }
    
    public receiveTodos(rawTodos : any[]) {
        rawTodos.forEach((rawTodo : any) => {
            var todo : any = this.sanitize(rawTodo, Todo.schema);
            this.upsertRow('todo', 'id', new Todo(todo));
        })

        this.emit('TodoStore.event.UPDATE');
    }
}

const  TodoStore = new TodoStoreClass();

export {
    TodoStoreClass,
    TodoStore
}