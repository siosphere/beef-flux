# beefjs
BeefJS is a Flux framework with Typescript Support, and can also be used standalone without Typescript.

It contains a URL Router, Data Store, Action Class, and an API Wrapper around jQuery to simplify and standardize API calls.

# Usage

# Routing
Routing can be used as both client-side routing as well as server-side routing. It supports passing in url parameters, sanitizing params, and support
for HTTP method matching

## Client routes
```
import * as Beef = require('beef')

let RoutingService = Beef.RoutingService

class RouteDefinitions
{
    ['/some/awesome/route']() => 
    {
        //do some action
    }

    ['/user/{userId}'](data) => 
    {
        //do some action
        console.log(data.userId)
    }

}

RoutingService.routes(new RouteDefinitions())

```
Beef allows you to define how your routes are handled. They can be handled via full url resolution, hash resolution, etc

```
//listen on hash changes
window.addEventListener('hashchange', () => {
    RoutingService.doRouting(window.location.hash)
})

//listen to html5 state change
window.addEventListener('onpopstate', () => {
    RoutingService.doRouting(window.location.href)
})
```

Beef's route decorators allow you to sanitize URL parameters
```
import * as Beef = require('beef')

let RoutingService = Beef.RoutingService

class RouteDefinitions
{
    @Beef.sanitize({
        type: 'int'
    })
    ['/user/{userId}'](data) => 
    {
        console.log(typeof data.userId) // integer
    }

}
```
## Server routes
Similar to client routes, server routes are setup in classes much the same, and are matched in a similar way, with the exception that they contain 
HTTP methods during the match as well.
```
import connect = require('connect')
import http = require('http')
import beef = require('beef')

let RoutingService = beef.RoutingService
let server = connect()

class ApiRouteDefinitions
{
    ['GET:/api/v1/todos'](request)
    {
        return {
            statusCode: 200,
            content: 'Test'
        }
    }
    
    ['POST:/api/v1/todos'](request)
    {
        return {
            statusCode: 200,
            content: 'Test'
        }
    }
}

RoutingService.routes(new ApiRouteDefinitions())

server.use((request, response, next) => {
    let method = request.method
    let url = request.url
    let route = `${method}:${url}`
    let routingResponse = RoutingService.doRouting(route, request)
    response.statusCode = routingResponse.statusCode
    response.end(routingResponse.content)
    next()
})

http.createServer(server).listen(3000)
```
## Routing Inside a React App
The RoutingService will return the value of the matched route function,
which allows you to use it easily within a react app, and have the different 
matched routes, return different React Components.

```

import * as Beef = require('beef')

let RoutingService = Beef.RoutingService

class RouteDefinitions
{
    ['/']() => 
    {
        return <Homepage />
    }

    ['/about']() => 
    {
        return <AboutUs />
    }
}

RoutingService.routes(new RouteDefinitions())

var AppContainer = React.createClass({
    getInitialState: function() {
        return {
            url: window.location.hash
        };
    },
    componentWillMount: function() {
        window.addEventListener("hashchange", this.onHashChange, false);
    },
    render: function() {
        //By default the url contains the # symbol, let's remove it
        var url = this.state.url.length > 0 ? this.state.url.substr(1) : '/';
        return RoutingService.doRouting(url);
    },
    
    onHashChange: function() {
        this.setState({
            url: window.location.hash
        });
    }
});

ReactDOM.render(<AppContainer />, document.body)

```

# Api Calls
Beef API Service provides a common wrapper around reqwest, making it so that every call is standard, and supports parameter replacement in the URL
```
import * as Beef = require('beef')
let ApiService = Beef.ApiService

let url = "/api/v1/users/{userId}";
let data = {
    userId: 1,
    foo: 'bar'
}

ApiService.get(url, data).then(success, error) // url = /api/v1/users/1?foo=bar
ApiService.post(url, data).then(success, error) // url = /api/v1/users/1, data = JSON.stringify({foo: 'bar'})
ApiService.put(url, data).then(success, error) // url = /api/v1/users/1, data = JSON.stringify({foo: 'bar'})
ApiService.delete(url, data).then(success, error) // url = /api/v1/users/1?foo=bar

```
It will also automatically replace variables in the URL that are surrounded
by curly braces.

For verbs that support a request body, the data that doesn't match a url token, 
will be sent in the body as a JSON encoded string. 
For all other verbs, it will be added to the query string.

# Store
Beef's Stores hold all the data in your application. A store can hold different
types of data, or a single type, depending on how you want to modularize, and
break up your app.

Stores also can subscribe to dispatched messages from Actions.

```
import * as Beef = require('beef')
import {TodoActions} from "./todo-actions"
import {Todo} from "./todo"

/**
 * Stores hold the data for our application, sanitize it, and listen for
 * actions to happen. 
 */
class TodoStoreClass extends Beef.Store 
{
    /**
     * Setting up our action listeners,
     */
    constructor()
    {
        super()

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
    receiveTodos(rawTodos)
    {
        
        rawTodos.forEach((rawTodo) => {
            /**
             * Sanitize our todo to the schema
             */
            var todo = this.sanitize(rawTodo, Todo.schema);
            this.upsertRow('todo', 'id', todo);
        });
        
        this.emit(TodoEvents.UPDATE);
    },
    
    /**
     * Get all the todos our store contains
     */
    getTodos()
    {
        return this.getRows('todo');
    },
});

export class TodoEvents
{
    public static UPDATE = 'TodoEvents.UPDATE'
}

export const TodoStore = new TodoStoreClass()
```
## Store Items
Items in a store can be anything, in the example above we are using a strict typed object with a specific schema.
```
import * as Beef = require('beef')

export class Todo
{
    public static schema = {}

    @Beef.Schema.int()
    id : number

    @Beef.Schema.string({
        initial: () => { return '' }
    })
    name : string

    @Beef.Schema.boolean({
        initial: () => { return false }
    })
    completed : boolean
}
```
The decorator will automatically populate the schema object, and when passed through the store's sanitize function, will make sure all fields are setup properly

## Rows
upsertRow allows you to update a row if it exists already, or insert a new one.

You give it a modelType, a primary key, and then the object
you want to insert, or update.

Updates are merge, and not replace. To do a replace, you would need to remove 
the existing row, and then upsert the new row.

```
import {TodoStore} from "./todo-store"

TodoStore.upsertRow('todo', 'id', {
    id: 1,
    title: 'My Title'
});

TodoStore.getRows('todo'); //[{id: 1, title: 'My Title'}]

var byTitle = TodoStore.getRows('todo').sort(TodoStore.sortBy('name', 'ASC'));

```

## Schema

Beef Stores support creating a schema to sanitize and/or validate a javascript
object against.

Each Schema is a javascript object, where the keys are the keys in the object,
and the values are a configuration object explaining how that key should be
validated, or sanitized.

Beef ships with decorators to aid in the creation of schema's, but the resulting schema
looks like:

```
Todo: {
    id: {
        type: 'int'
    },
    name: {
        type: 'string',
        initial: function() {
            return ''
        }
    },
    completed: {
        type: 'boolean',
        initial: function() {
            return false
        }
    }
}
```

If no initial value callback is provided, and the value doesn't exist in the
object you are sanitizing, it will default to null.

You can use helper functions, or decorators to build your schemas
```
import * as Beef = require('beef')

//helper functions
let TodoSchema = {  
    id: Beef.Store.int(),

    name: Beef.Store.string({
        initial: function() {
            return '';
        }
    }),

    completed: Beef.Store.boolean({
        initial: function() {
            return false;
        }
    })
}

//decorators
class Todo
{
    public static schema = {}

    @Beef.Schema.int()
    id : number

    @Beef.Schema.string({
        initial: () => { return '' }
    })
    name : string

    @Beef.Schema.boolean({
        initial: () => { return false }
    })
    completed : boolean
}
```

Schemas also allow you to validate sub objects, or an array against a given
schema.

```
import * as Beef = require('beef')
import {Todo} from "./todo"

class User
{
    public static schema = {}
    @Beef.Schema.object({
        schema: () => {
            return Todo.schema
        }
    })
    todos : Todo[]
}
```

To allow an object to be anything, instead of doing a callback, simply have 
schema be null.

### Validation
You an also add validation to the schema, which when passed through the 
validator will return the object, or an array of errors if it isn't valid.
```
class Todo
{
    public static schema = {}

    @Beef.Schema.string({
        initial: () => { return '' },
        validation: {
            minLength: 5,
            maxLength: 10,
            required: true,
            isNotLoremIpsum: (value) => {
                return value !== "Lorem Ipsum"
            }
        }
    })
    name : string
}
```

Built in validators include:
**required** the value cannot be undefined, null, or an empty string  
**minLength** the string value length must be greater than this  
**maxLength** the string value length must be less than this  

You can do custom validators, by doing a callback function that will receive
the value of that field, and return true or false.

## Events
Stores can emit any events they choose, which can be listened on from your app,
or in the case of React, within your components

```
import {TodoStore, TodoEvents} from "./todo-store"

TodoStore.listen(TodoEvents.UPDATE, () => {
    console.log('todos updated', TodoStore.getRows('todo));
});
```
You can also turn off the listeners by using .ignore
```
TodoStore.ignore(TodoEvents.UPDATE, myCallback);
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
class TodoActionsClass extends Beef.Actions
{
    /**
     * We are receiving an array of todos
     */
    receiveTodos(rawTodos) 
    {
        return rawTodos
    }
    
}

export const TodoActions = Beef.Actions.create(new TodoActionsClass())
```

When the store listens on the action, the store callback will receive the results
of the action. For the most part, most actions will just return an object
with the data they received.

On the store side, you can then register a callback for that specific action.
```
import {TodoActions} from "./todo-actions"

class TodoStore extends Beef.Store
{
    constructor()
    {
        super()
        TodoActions._register({    
            /**
            * When TodoActions.receiveTodos is called, update our todos
            */
            receiveTodos: TodoActions.receiveTodos
        }, this);
    }

    receiveTodos(rawTodos)
    {
        console.log('got raw todos', rawTodos)
    }
}

```

The key is the function on our store we want to be called, when the referenced
action happens. Calling TodoActions.receiveTodos([]), will dispatch the message 
and the store's "receiveTodos" method with the results (an empty
array)