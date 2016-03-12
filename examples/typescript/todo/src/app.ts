class AppContainer {
    
    constructor()
    {
        todoStore.listen('TodoStore.event.UPDATE', this.onUpdate);
    }
    
    createTodo() {
        TodoActions.receiveTodos([{
            name: 'My New Todo',
            id: 1
        }]);
    }
    
    onUpdate() {
        console.log(todoStore.getTodos());
    }
}


var App = new AppContainer();