/**
 * Stores hold the data for our application, sanitize it, and listen for
 * actions to happen. 
 */
var TodoStore = Beef.Store().create({
    
    /**
     * Setting up our action listeners,
     */
    actions: function() {
        
        /**
         * For each ActionClass, we can register several callbacks.
         * The "key" is the function on our store we want to be called, when
         * the Action method that is in the "value" is called.
         * 
         * Our callback will receive the return value of the action we are
         * listening on
         */
        TodoActions._register({
            
            /**
             * When TodoActions.receiveTodos is called, update our todos
             */
            receiveTodos: TodoActions.receiveTodos
        }, this);
    },
    
    /**
     * Receive an array of todos, upsert them, and then emit an event
     * saying we changed
     */
    receiveTodos: function(rawTodos) {
        
        rawTodos.forEach(function(rawTodo) {
            /**
             * Sanitize our todo to the schema
             */
            var todo = TodoStore.sanitize(rawTodo, TodoStore.schema.Todo);
            TodoStore.upsertRow('todo', 'id', todo.id, todo);
        });
        
        TodoStore.emit('TodoStore.event.UPDATE');
    },
    
    /**
     * Get all the todos our store contains
     */
    getTodos: function()
    {
        return TodoStore.getRows('todo');
    },
    
    /**
     * Hold the schemas for the various data we may contain
     */
    schema: {
        
        /**
         * A simple todo with nothing but an id that must be an integer,
         * and a title that must be a string, and by default is empty.
         * 
         * If no "initial" callback is set, the field will default to null
         */
        Todo: {
            
            id: Store.int(),
            
            title: Store.string({
                initial: function() {
                    return '';
                }
            })
        }
    }
    
});