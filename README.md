# beefjs
BeefJS is a React/Flux architecture friendly micro framework. It also contains a few abstractions of jQuery to simplify API calls.

# Routing
```

var Router = Beef.service(RoutingService.SERVICE_ID);

Router.routes({
    'url/slug': function() {
        console.log('when the slug matches');
    },
    'with/{id}': function(data) {
      console.log('got', data.id);
    }
});
```
```
$(window).on('hashchange', Router.doRouting);
```

# Api Calls
```
var Api = Beef.service(ApiService.SERVICE_ID);
Api.get(url, {param: 'value'}).success().error()
```

```
var MY_API_URL = '/api/v1/users/{userId}/';
Api.get(MY_API_URL, {userId: 1}).success().error(); //will replace {userId} with the given param
```

```
Api.get('/my/url', {userId: 1}); //final url would be /my/url?userId=1
```

#Store - using TypeScript
```
class MyStore extends Store {
    constructor() {
        this.dispatchIndex = this.getDispatcher().register(function( payload : DispatcherPayload) {
        });
    }
}

var store = new MyStore();
```
## Rows
```
store.upsertRow('todos', 'id', 1, {
    id: 1,
    title: 'My Title',
    desc: 'My Description'
});

store.getRows('todos'); //[{id: 1, title: 'My Title', desc: 'My Description}]

var byTitle = store.getRows('todos').sort(MyStore.sortBy('name', 'ASC'));

```

## Schema
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
### Validation
You an also add validation to the schema, which when passed through the validator will return the object, or an array of errors if it isn't valid.
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
## Events
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

# Dispatcher
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
