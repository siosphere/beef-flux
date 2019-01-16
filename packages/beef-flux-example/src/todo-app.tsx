import * as React from 'react'

// # Actions
import TodoActions from './actions/todo-actions'

// # Components
import TodoList from './component/todo-list'
import CreateTodo from './component/create-todo'

// # Model
import TodoStore, {Todo as TodoModel, TodoStoreState, Todo} from './model/todo-store'

interface TodoAppState
{
    todos : TodoModel[]
}

@TodoStore.subscribe(TodoApp.onTodoAppUpdate)
class TodoApp extends React.Component<{}, TodoAppState>
{
    constructor(props : any)
    {
        super(props)

        this.state = {
            todos: TodoStore.getState().todos
        }
    }

    render() {
        return <div>
            <TodoList todos={this.state.todos} toggle={(todo : TodoModel) => {
                todo.done = !todo.done
                TodoActions.RECEIVE_TODOS([todo])
            }} />
            <CreateTodo />
            <div onClick={() => {
                console.log(TodoStore.dump())
            }}>Hey</div>
        </div>
    }

    static onTodoAppUpdate(componentState : TodoAppState, nextStoreState : TodoStoreState, oldStoreState : TodoStoreState) : Partial<TodoStoreState>
    {
        return {
            todos: nextStoreState.todos
        }
    }
}

export default TodoApp