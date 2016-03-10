
class TodoActionsClass extends Action {
    
    receiveTodos(todos : any[])
    {
        return todos;
    }
};

var TodoActions : TodoActionsClass = Actions.create(new TodoActionsClass());