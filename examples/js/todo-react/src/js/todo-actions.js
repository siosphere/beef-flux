/**
 * Action classes contain actions that can be listened on by stores.
 * 
 * Stores will listen to an Action's methods, and a callback will be triggered
 * with the returned result of the Action.
 */

var TodoActions = Beef.Actions().create({
    
    /**
     * We are receiving an array of todos
     * @param array rawTodos
     * @returns array
     */
    receiveTodos: function(rawTodos) {
        return rawTodos;
    }
    
});