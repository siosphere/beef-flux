# beefjs
BeefJS is a Flux framework with Typescript Support, and can also be used standalone without Typescript.

It contains a URL Router, Data Store, Action Class, and an API Wrapper around jQuery to simplify and standardize API calls.

# Non-Typescript Setup

# Routing
Routes are setup in a very simple way. Using a Javascript object, the keys 
become the routes, and the values are functions that will be executed if that
route matches.

The keys can also be parameterized urls using {someName}, for example:
```
Beef.Router().routes({
    'todo/{todoId}': function(data) {
        console.log('Viewing todo', data.todoId);
    },
    'todos': function() {
        console.log('Viewing all todos');
    }
});
```

You can pass in a url directory into the router like:
```
var url = 'todo/123';

Beef.Router().route(url);
```
Or you can let the router automatically read it from the url hash by calling
doRouting.

```
$(window).on('hashchange', Router.doRouting);
```

## Inside a React App
The Beef.Router.route(url) will return the value of the matched route function,
which allows you to use it easily within a react app, and have the different 
matched routes, return different React Components.

```
var AppContainer = React.createClass({
    getInitialState: function() {
        return {
            url: window.location.hash
        };
    },
    componentWillMount: function() {
        window.addEventListener("hashchange", this.onHashChange, false);
        this.setupRoutes();
    },
    setupRoutes: function() {
        Beef.Router().routes({
            '/': function() {
                return (<Homepage />);
            }
        });
    },
    render: function() {
        //By default the url contains the # symbol, let's remove it
        var url = this.state.url.length > 0 ? this.state.url.substr(1) : '/';
        return Beef.Router().route(url);
    },
    
    onHashChange: function() {
        this.setState({
            url: window.location.hash
        });
    }
});
```

# Api Calls
jQuery does a great job of abstracting away a lot of the complexities with doing
XHR requests. However, their implementation isn't standard across every HTTP 
verb.

The Beef API Service makes it so that every call is standard, 
```
Beef.Api().{verb}(url, data).success().error();
```
Where verb is a valid HTTP verb (get, post, put, delete)

It will also automatically replace variables in the URL that are surrounded
by curly braces, for example:
```
Beef.Api().get('/api/todos/{todoId}', {
    todoId: 123
});
```

This will do a GET request to /api/todos/123

This simplifies you from having to do odd concatenations (no more, '/api/todos/' + todo.id)

For verbs that support a request body, the data that doesn't match a url token, 
will be sent in the body. For all other verbs, it will be added to the query
string.

```
Beef.Api().get('/my/url', {userId: 1}); //final url would be /my/url?userId=1
```

# Store
Beef's Stores hold all the data in your application. A store can hold different
types of data, or a single type, depending on how you want to modularize, and
break up your app.

Stores also can subscribe to dispatched messages from Actions.

```
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
```

## Rows
upsertRow allows you to update a row if it exists already, or insert a new one.

You give it a modelType, a primary key, a primary key value, and then the object
you want to insert, or update to.

Updates are merge, and not replace. To do a replace, you would need to remove 
the existing row, and then upsert the new row.

```
TodoStore.upsertRow('todo', 'id', 1, {
    id: 1,
    title: 'My Title'
});

store.getRows('todos'); //[{id: 1, title: 'My Title'}]

var byTitle = TodoStore.getRows('todos').sort(TodoStore.sortBy('name', 'ASC'));

```

## Schema

Beef Stores support create a schema to sanitize and/or validate a javascript
object against.

Each Schema is a javascript object, where the keys are the keys in the object,
and the values are a configuration object explaining how that key should be
validated, or sanitized.

Beef contains some helper functions to abstract some of it away, but without 
the helper functions schemas are setup like:
```
Todo: {
    id: {
        type: 'int',
        initial: function() {
            return 0;
        }
    }
}
```

If no initial value callback is provided, and the value doesn't exist in the
object you are sanitizing, it will default to null.

```
Todo: {  
    id: Store.int(),

    title: Store.string({
        initial: function() {
            return '';
        }
    })
}
```

Schemas also allow you to validate sub objects, or an array against a given
schema.

```
Todo: {
    user: Store.object({
        schema: function()
        {
            return TodoStore.schema.User;
        }
    })
}
```

To allow an object to be anything, instead of doing a callback, simply have 
schema be null.

### Validation
You an also add validation to the schema, which when passed through the 
validator will return the object, or an array of errors if it isn't valid.
```
Todo: {
    title: Store.string(),
    desc: Store.string({
        validation: {
            minLength: 5,
            maxLength: 10,
            required: true,
            isNotLoremIpsum: function(value) {
                return value !== 'Lorem Ipsum';
            }
        }
    })
}
```

Built in validators include:  
**required** the value cannot be undefined, null, or an empty string  
**minLength** the string value length must be greater than this  
**maxLength** the string value length must be less than this  

You can do custom validators, by doing a callback function that will receive
the value of that field, and returning true or false.

## Events
Stores can emit any events they choose, which can be listened on from your app,
or in the case of React, within your components

```
TodoStore.listen('TodoStore.UPDATE', function(){
    console.log('todos updated', TodoStore.getTodos());
});
```
You can also turn off the listeners by using .ignore
```
TodoStore.ignore('TodoStore.UPDATE', myCallback);
```

# Actions
Beef contains action classes, which help to simply the flux dispatcher pattern.
A common trend is to have your store register with the Dispatcher, and then
a switch statement for the message type, which then calls a function.

This can lead to messy situations, where developers begin to add logic
within the switch statement, and adds a lot of boilerplate code that is
unnecessary.

In Beef, you define an action class, which will contain available methods a 
store can listen on, and available methods you can call.
```
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
```

When the store listens on the action, it's callback will receive the results
of the action. For the most part, most actions will just return an object
with the data they received.

On the store side, you can then register a callback for that specific action.
```
TodoActions._register({    
    /**
     * When TodoActions.receiveTodos is called, update our todos
     */
    receiveTodos: TodoActions.receiveTodos
}, this);
```

The key is the function on our store we want to be called, when the referenced
action happens. Calling TodoActions.receiveTodos([]), will dispatch the message 
and the store's "receiveTodos" method will be called with the results (an empty
array)

# Dispatcher
Beef also contains a traditional flux dispatcher if so required.

```
Beef.Dispatcher().register(function(payload) {
    switch(payload.type) {
        case 'Todo.actions.receiveTodos':
            TodoStore.receiveTodos(payload.data);
        break;
});

Beef.Dispatcher().dispatch('Todo.actions.receiveTodos', []);
```

# Typescript

# Store - using TypeScript
```
class MyStore extends Store {
    constructor() {
        
    }
}

var store = new MyStore();
```

## Schema - using TypeScript
```
class MyStore extends Store {
    public createTodo(title : string, description : string) {
        return this.sanitize({
            title: title,
            desc: description
        }, MyStore.schema.Todo);
    }

    public static schema : any = {
        Todo: {
            title: {
                type: 'string'
            },
            desc: {
                type: 'string'
            }
        }
    }
}
```
### Validation - using TypeScript
```
class MyStore extends Store {
    public createTodo(title : string, description : string) {
        return this.sanitize({
            title: title,
            desc: description
        }, MyStore.schema.Todo);
    }

    public static schema : any = {
        Todo: {
            title: {
                type: 'string'
            },
            desc: {
                type: 'string',
                validation: {
                    minLength: 5,
                    maxLength: 10,
                    required: true,
                    isNotLoremIpsum: function(value) {
                        return value !== 'Lorem Ipsum';
                    }
                }
            }
        }
    }
}
```

## Events - TypeScript
```
class MyStore extends Store {
    public createTodo(title : string, description : string) {
        this.emit(MyStore.events.UPDATE);
    }

    public static events : any = {
        UPDATE: 'MyStore.events.UPDATE'
    }
}

var onUpdate = function() {
   console.log('updated');
};

store.listen(MyStore.events.UPDATE, onUpdate);
store.ignore(MyStore.events.UPDATE, onUpdate);
```

# Actions - TypeScript
```
class TodoActionsClass extends Action {
    
    receiveTodos(todos : any[])
    {
        return todos;
    }
};

var TodoActions : TodoActionsClass = Actions.create(new TodoActionsClass());
```

# Dispatcher - TypeScript
Beef also contains a traditional flux dispatcher if so required.

```
Dispatcher.register(function(payload : DispatcherPayload) {
    var event = payload.event;
    var data = payload.data;
    switch(event) {
        case 'SOME_ACTION':
            console.log('SOME_ACTION took place', data.some);
            break;
    }
}, []);
```
```
Dispatcher.dispatch('SOME_ACTION', {
    some: 'data'
});
```
