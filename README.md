# beefjs
BeefJS is a React/Flux architecture friendly micro routing framework. It also contains a few abstractions of jQuery to simplify API calls.

# Routing
```
Beef.Router.routes({
    'url/slug': function() {
        console.log('when the slug matches');
    },
    'with/{id}': function(data) {
      console.log('got', data.id);
    }
});
```
```
$(window).on('hashchange', Beef.Router.doRouting);
```

# Api Calls
```
Beef.Api.get(url, {param: 'value'}).success().error()
```

```
var MY_API_URL = '/api/v1/users/{userId}/';
Beef.Api.get(MY_API_URL, {userId: 1}).success().error(); //will replace {userId} with the given param
```

```
Beef.Api.get('/my/url', {userId: 1}); //final url would be /my/url?userId=1
```

#Store
```
var MyStore = Beef.Store.create({
    dispatchIndex: Beef.Dispatcher.register(function(payload) {
        
    })
});
```
## Rows
```
MyStore.upsertRow('todos', 'id', 1, {
    id: 1,
    title: 'My Title',
    desc: 'My Description'
});

MyStore.getRows('todos'); //[{id: 1, title: 'My Title', desc: 'My Description}]

var byTitle = MyStore.getRows('todos').sort(MyStore.sortBy('name', 'ASC'));

```

## Schema
```
var MyStore = Beef.Store.create({
    schema: {
        Todo: {
            title: {
                type: 'string'
            },
            desc: {
                type: 'string'
            }
        }
    },
    createTodo: function(title, description) {
        return MyStore.sanitize({
            title: title,
            desc: description
        }, MyStore.schema.Todo);
    }
});
```
## Events
```
var MyStore = Beef.Store.create({
    events: {
        UPDATE: 'MyStore.events.UPDATE'
    },
    createToDo: function() {
        MyStore.emit(MyStore.events.UPDATE);
    }
});

var onUpdate = function() {
   console.log('updated');
};

MyStore.listen(MyStore.events.UPDATE, onUpdate);
MyStore.ignore(MyStore.events.UPDATE, onUpdate);
```

# Dispatcher
```
Beef.Dispatcher.register(function(payload) {
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
Beef.Dispatcher.dispatch('SOME_ACTION', {
    some: 'data'
});
```
