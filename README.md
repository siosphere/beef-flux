# beefjs


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
    title: 'My Title',
    desc: 'My Description'
});
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
    }
});

var onUpdate = function() {
   console.log('updated');
};

MyStore.listen(MyStore.events.UPDATE, onUpdate);
MyStore.ignore(MyStore.events.UPDATE, onUpdate);
```
