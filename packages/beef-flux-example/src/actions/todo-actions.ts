import Store from '@beef-flux/store'

class TodoActions extends Store.Actions
{
    RECEIVE_TODOS(rawTodos : any[])
    {
        return rawTodos
    }
}

export default TodoActions