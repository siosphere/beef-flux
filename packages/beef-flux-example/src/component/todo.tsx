import * as React from 'react'
import TodoModel from '../model/todo'

interface TodoProps
{
    toggle: (...any) => any
}


const Todo = (props : TodoModel & TodoProps) => {
    return <li onClick={props.toggle} className={`${props.done ? 'done' : ''}`}>
        <strong>{props.title}</strong>
        <em>{props.id}</em>
    </li>
}

export default Todo