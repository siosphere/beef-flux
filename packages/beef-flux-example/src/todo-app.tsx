import * as React from 'react'
import Store from '@beef-flux/store'

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

@TodoStore.subscribe((componentState : TodoAppState, nextStoreState : TodoStoreState, oldStoreState : TodoStoreState) => {
    console.log('update was called', nextStoreState)
    return {
        todos: nextStoreState.todos
    }
})
class TodoApp extends React.Component<{
	_manager ?: any
}, TodoAppState>
{
    constructor(props : any)
    {
		super(props)

        /*this.state = {
            todos: props.todoStore.getState().todos
        }
        
        console.log('original constructor')*/
    }

    render() {
        return <div>
            <TodoList todos={this.state.todos} toggle={(todo : TodoModel) => {
                todo.done = !todo.done
                TodoActions.RECEIVE_TODOS([todo])
            }} />
            <CreateTodo />
            <div onClick={() => {
                console.log(this.props._manager.dump())
            }}>Hey</div>
        </div>
    }
}

export default Store.Wrap(TodoApp)