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

@TodoStore.bind("todoStore")
@Store.subscribe({
	"todoStore": TodoApp.onTodoAppUpdate
})
class TodoApp extends React.Component<{
	todoStore ?: TodoStore
}, TodoAppState>
{
	static contextType = Store.Context

    constructor(props : any)
    {
		super(props)

        this.state = {
            todos: props.todoStore.getState().todos
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
                console.log(this.props.todoStore.dump())
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