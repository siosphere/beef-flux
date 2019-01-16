import Store from '@beef-flux/store'

class TodoActions extends Store.Actions
{
    RECEIVE_TODOS(rawTodos : any[])
    {
        return rawTodos
    }
}

const Actions = new TodoActions()

export default Actions