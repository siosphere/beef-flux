# beef-flux
BeefFlux is a Flux framework with Typescript Support, and can also be used standalone without Typescript.

It contains a URL Router, Data Store, Action Class, and an API Wrapper around reqwest to simplify and standardize API calls.

# Usage

# Routing
Routing can be used as both client-side routing as well as server-side routing. It supports passing in url parameters, sanitizing params, and support
for HTTP method matching

## Client routes
```typescript
import * as Beef from 'beef-flux'

const Router = Beef.RoutingService

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

Router.routes(new RouteDefinitions())

```
Beef allows you to define how your routes are handled. They can be handled via full url resolution, hash resolution, etc

```typescript
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
```typescript
import * as Beef from 'beef-flux'

const Router = Beef.RoutingService

class RouteDefinitions
{
    @Beef.sanitize({
        userId: {
            type: 'int'
        }
    })
    ['/user/{userId}'](data) => 
    {
        console.log(typeof data.userId) // number
    }

}

Router.routes(new RouteDefinitions())
```
## Server routes
Similar to client routes, server routes are setup in classes much the same, and are matched in a similar way, with the exception that they contain 
HTTP methods during the match as well.
```
import connect = require('connect')
import http = require('http')
import Beef from 'beef-flux'

const Router = Beef.RoutingService
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

Router.routes(new ApiRouteDefinitions())

server.use((request, response, next) => {
    let method = request.method
    let url = request.url
    let route = `${method}:${url}`
    let routingResponse = Router.doRouting(route, request)
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

```typescript

import * as Beef from 'beef-flux'
import * as React from 'react'
import * as ReactDOM from 'react-dom'

import Homepage from './homepage'
import AboutUs from './about-us'

const Router = Beef.RoutingService

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

Router.routes(new RouteDefinitions())

class AppContainer extends React.Component<{}, {}>
{
    constructor()
    {
        super()

        this.state = {
            url: window.location.hash
        }

        this.onHashChange = this.onHashChange.bind(this)
    }

    componentWillMount()
    {
        window.addEventListener("hashchange", this.onHashChange, false)
    }
    
    render()
    {
        const url = this.state.url.length > 0 ? this.state.url.substr(1) : '/'

        return Router.doRouting(url)
    }

    protected onHashChange()
    {
        this.setState({
            url: window.location.hash
        })
    }
}

ReactDOM.render(<AppContainer />, document.body)

```

# Api Calls
Beef API Service provides a common wrapper around reqwest, making it so that every call is standard, and supports parameter replacement in the URL
```typescript
import * as Beef from 'beef-flux'

const Api = Beef.ApiService

let url = "/api/v1/users/{userId}";
let data = {
    userId: 1,
    foo: 'bar'
}

Api.get(url, data).then(success, error) // url = /api/v1/users/1?foo=bar
Api.post(url, data).then(success, error) // url = /api/v1/users/1, data = JSON.stringify({foo: 'bar'})
Api.put(url, data).then(success, error) // url = /api/v1/users/1, data = JSON.stringify({foo: 'bar'})
Api.delete(url, data).then(success, error) // url = /api/v1/users/1?foo=bar

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

Stores also subscribe to dispatched messages from Actions.

Stores contain state that is returned to registered listeners whenever that state changes

```typescript
import * as Beef from 'beef-flux'
import {RECEIVE_TODOS} from "./todo-actions"
import Todo from "./todo"

interface TodoStoreState
{
    todos : Todo[]
}

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
         * The "value" is the function on our store we want to be called, when
         * the Action method that is in the "value" is called.
         * 
         * Our callback will receive the return value of the action we are
         * listening on
         */
        Beef.Actions.register({
            
            /**
             * When RECEIVE_TODOS is called, update our todos
             */
            [RECEIVE_TODOS]: this.receiveTodos.bind(this)
        }, this)
    }

    /**
     * Get all the todos our state contains, optionally
     * pass in a state object, and pull from there
     */
    public getTodos(nextState ?: TodoStoreState)
    {
        let state = nextState ? nextState : this.state

        return state.todos
    }
    
    /**
     * Receive an array of todos, create the next state, upsert them, 
     * and then return the new state
     */
    protected receiveTodos(rawTodos)
    {
        let nextState = this.nextState()

        rawTodos.forEach((rawTodo) => {
            /**
             * Sanitize our todo to the schema
             */
            let todo = this.sanitize(rawTodo, Todo.schema)
            this.upsertItem(nextState.todos, todo.id, todo)
        });
        
        return nextState
    }
});

const TodoStore = new TodoStoreClass()

export default TodoStore
```
## Store Items
Items in a store can be anything, in the example above we are using a strict typed object with a specific schema.

```typescript
import * as Beef from 'beef-flux'

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

export default Todo
```
The decorator will automatically populate the schema object, and when passed through the store's sanitize function, will make sure all fields are setup properly

### Supported types:
#### bool
Will sanitize a given value into a boolean, casting "true" = true, "false" = false, 0 = false, 1 = true
```typescript
@Beef.Schema.bool()
```
#### int
Will sanitize the value to a whole number
```typescript
@Beef.Schema.int()
```
#### float
Will sanitize the value to a float
```typescript
@Beef.Schema.float()
```
#### double
Will sanitize the value into a double
```typescript
@Beef.Schema.double()
```
#### string
Will sanitize the value to a string
```typescript
@Beef.Schema.string()
```
#### array
If given a "schema" callback, will sanitize all members of the array to the given schema,
otherwise no sanitization is performed on the members
```typescript
@Beef.Schema.array({
    initial: () => [],
    schema: () => MyOtherObject.schema,
})
```
#### object
Requires a schema: () => {} callback, if it returns null, no schema sanitization is performed,
otherwise the object is sanitized agaisnt the given schema.
Optionally can provide a "constructor" which refers to a class
```typescript
@Beef.Schema.object({
    schema: () => MyOtherObject.schema,
    constructor: MyOtherObject
})
```
#### datetime
Required MomentJS to be available in the global scope, and will sanitize the value into a moment.Moment object
```typescript
@Beef.Schema.datetime()
```
#### callback
Allows you to optionally add a function to a schema object
```typescript
@Beef.Schema.callback()
```
#### customType
Allows you to provide a custom sanitization callback (such as sanitizing for email, phone number, or other complex types)
```typescript
@Beef.Schema.customType('phone', {
    sanitize: (value, properties) => {
        let prop1 = properties.prop1
        let prop2 = properties.prop2

        return value + prop1 + prop2
    },
    prop1: 'a',
    prop2: 'b'
})
```

## Items
upserItem allows you to update a row if it exists already, or insert a new one.

You give it an array, a primary key value, and then the object
you want to insert, or update.

Updates are merge, and not replace. To do a replace, you would need to remove 
the existing row, and then upsert the new row.

```
import TodoStore from "./todo-store"

let todos = []

let todo = {
    id: 1,
    title: 'My Title'
}

TodoStore.upsertItem(todos, todo.id, todo)

let byTitle = todos.sort(TodoStore.sortBy('name', 'ASC'))

```

## Schema - no decorator

Beef Stores support creating a schema to sanitize and/or validate a javascript
object against.

Each Schema is a javascript object, where the keys are the keys in the object,
and the values are a configuration object explaining how that key should be
validated, or sanitized.

Beef ships with decorators to aid in the creation of schemas

Creating a Schema without decorators is just as easy as defining a simple JS Object

```js
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

### Validation
You an also add validation to the schema, which when passed through the 
validator will return the object, or an array of errors if it isn't valid.
```typescript
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

## Store Listeners
You can register a listener into a store, that will be called whenever the store's state changes, and receive the new state from the store.
```typescript
import TodoStore, {TodoStoreState} from "./todo-store"

let todos = []

const OnTodoStoreUpdate = (nextState : TodoStoreState) => {
    todos = nextState.todos
}

TodoStore.listen(OnTodoStoreUpdate)
//TodoStore.ignore(OnTodoStoreUpdate)
```
# Actions
Beef contains action classes, which help to simply the flux dispatcher pattern.
A common trend is to have your store register with the Dispatcher, and then
a switch statement for the message type, which then calls a function.

This can lead to messy situations, where developers begin to add logic
within the switch statement, and adds a lot of boilerplate code that is
unnecessary.

In Beef, you define and export action callbacks, and register them into the store
```typescript
import * as Beef from 'beef-flux'

export const RECEIVE_TODOS : any = Beef.Actions.define('RECEIVE_TODOS', rawTodos => rawTodos)
```

When the store listens on the action, the store callback will receive the results
of the action. For the most part, most actions will just return an object
with the data they received.

On the store side, you can then register a callback for that specific action.
```typescript
import * as Beef from 'beef-flux'
import {RECEIVE_TODOS} from "./todo-actions"

interface TodoStoreState
{
    todos : any[]
}

class TodoStore extends Beef.Store<TodoStoreState>
{
    constructor()
    {
        super()
        this.state = {
            todos: []
        }

        Beef.Actions.register({    
            [RECEIVE_TODOS]: this.receiveTodos.bind(this)
        }, this);
    }

    receiveTodos(rawTodos)
    {
        let nextState = this.nextState()

        rawTodos.forEach((rawTodo) => {
            /**
             * Sanitize our todo to the schema
             */
            let todo = this.sanitize(rawTodo, Todo.schema)
            this.upsertItem(nextState.todos, todo.id, todo)
        });
        
        return nextState
    }
}

```