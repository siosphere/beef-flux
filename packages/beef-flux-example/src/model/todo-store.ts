import Store from '@beef-flux/store'
import Todo from './todo'
import TodoActions from '../actions/todo-actions'

interface TodoStoreState
{
    todos : Todo[]
}

class TodoStore extends Store.BaseStore<TodoStoreState>
{
    constructor(todoActions : TodoActions)
    {
        super()

        this.state = {
            todos: []
        }

        todoActions.__register({
            RECEIVE_TODOS: this.onReceiveTodos.bind(this)
        }, this)
    }

    sanitizeTodo(rawTodo : any) : Todo
    {
        return new Todo(this.sanitize(rawTodo, Todo.schema))
    }

    protected onReceiveTodos(rawTodos : any[]) : TodoStoreState
    {
        let nextState = this.nextState()

        rawTodos.forEach((rawTodo) => {
            let todo = this.sanitizeTodo(rawTodo)
            this.upsertItem(nextState.todos, todo.id, todo)
        })

        return nextState
    }
}

export default TodoStore

export {
    Todo,
    TodoStoreState
}