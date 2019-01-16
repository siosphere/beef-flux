import * as React from 'react'

// # Actions
import TodoActions from '../actions/todo-actions'

interface CreateTodoProps
{

}

interface CreateTodoState
{
    title : string
}

class CreateTodo extends React.PureComponent<CreateTodoProps, CreateTodoState>
{
    constructor(props)
    {
        super(props)

        this.state = {
            title: ''
        }

        this.createTodo = this.createTodo.bind(this)
        this.isValid = this.isValid.bind(this)
    }

    render()
    {
        return <form className="create-todo-form" onSubmit={this.createTodo}>
            <input type="text" value={this.state.title} onChange={e => { this.setState({ title: e.target.value }) }} />
            <button type="submit" disabled={!this.isValid()}>Create Todo</button>
        </form>
    }

    createTodo(e)
    {
        e.preventDefault()

        TodoActions.RECEIVE_TODOS([{
            title: this.state.title
        }])

        this.setState({
            title: ''
        })
    }

    isValid() : boolean
    {
        return this.state.title && this.state.title.length > 0
    }
}

export default CreateTodo