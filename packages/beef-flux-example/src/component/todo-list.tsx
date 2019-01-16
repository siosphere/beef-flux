import * as React from 'react'
import TodoModel from '../model/todo'
import Todo from './todo'

interface TodoListProps
{
    todos : TodoModel[]
    toggle : (...any) => any
}

const TodoList = (props : TodoListProps) => {
    return <ul className="todo-list">
        {props.todos.map(todo => 
            <Todo key={todo.id} {...todo} toggle={props.toggle.bind(null, todo)} />
        )}
    </ul>
}

export default TodoList