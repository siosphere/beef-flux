# beefjs


# Routing
Beef.Router.routes({
    'url/slug': function() {
        console.log('when the slug matches');
    },
    'with/{id}': function(data) {
      console.log('got', data.id);
    }
});

$(window).on('hashchange', Beef.Router.doRouting);
