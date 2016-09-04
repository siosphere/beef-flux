/// <reference path="../../../../dist/typings/index.d.ts" />

import beef = require('beef')

class TodoActionsClass extends beef.Action {
    
    receiveTodos(todos : any[])
    {
        return todos;
    }
};

export const TodoActions : TodoActionsClass = beef.Actions.create(new TodoActionsClass());