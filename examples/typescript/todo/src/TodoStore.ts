class TodoStore extends Store
{
    constructor()
    {
        super();

        TodoActions._register({
            receiveTodos: TodoActions.receiveTodos
        }, this);

    }
    
    public getTodos() : any[]
    {
        return this.getRows('todo');
    }
    
    public receiveTodos(rawTodos : any[]) {
        rawTodos.forEach((rawTodo : any) => {
            var todo : any = this.sanitize(rawTodo, TodoStore.schema.Todo);
            this.upsertRow('todo', 'id', todo.id, todo);
        })

        this.emit('TodoStore.event.UPDATE');
    }

    public static schema : any = {
        Todo: {
            name: Store.string(),
            id: Store.int()
        }
    }
}
var todoStore = new TodoStore();