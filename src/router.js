/**
 * 
 * 
 */

Beef.Router = new function() {
    return {
        /**
         * On route change
         * @returns {undefined}
         */
        onRoute: function(){ },
        
        /**
         * Holds our routes
         */
        _routes: null,
        
        /**
         * Sets our routes
         * @param {type} routes_obj
         * @returns {undefined}
         */
        routes: function(routes_obj){
            Beef.Router._routes = routes_obj;
        },
        
        /**
         * What is our current active route
         */
        _activeRoute: '',
        
        /**
         * Holds the data submitted from the route url. {params}
         */
        _routeData: {},
        
        /**
         * Completes our route
         * @param {type} route
         * @param {type} data
         * @returns {undefined}
         */
        route: function(route, data){
            if(typeof(Beef.Router._routes[route]) !== 'undefined'){
                Beef.Router._routes[route](data);
                Beef.Router._activeRoute = route;
                Beef.Router.onRoute();
            }
        },
        /**
         * Parse our route from the URL
         * @returns {undefined}
         */
        doRouting: function(){
            for(var raw_route in Beef.Router._routes){
                var route = match_route = raw_route;
                var raw_hash = window.location.hash;
                if (raw_hash.indexOf('?') >= 0) {
                    raw_hash = raw_hash.substring(0, raw_hash.indexOf('?'));
                }
                var res = raw_route.match(/\{[a-z\_\-\+]+\}/gi);
                var data = {};
                
                //pull these params from the route
                if(res !== null){
                    var route_parts = raw_route.split('/');
                    var hash_parts = raw_hash.split('/');
                    hash_parts = hash_parts.splice(1, hash_parts.length - 1);
                    
                    if(hash_parts.length !== route_parts.length){
                        continue;
                    }
                    
                    var i = 0;
                    var bError = false;
                    
                    hash_parts.forEach(function(part){
                        if(!route_parts[i].match(/\{[a-z\_\-\+]+\}/gi)){
                            if(part !== route_parts[i]){
                                bError = true;
                            }
                        }
                        i++;
                    });
                    
                    if(bError){
                        continue;
                    }
                    
                    
                    //reset the match route for regex
                    match_route = '';
                    route_parts.forEach(function(part, index){
                        if(index > 0){
                            match_route += '/';
                        }
                        match_route += hash_parts[index];
                        if(index > 0){
                            data[part.replace(/[\{\}]/gi, '')] = hash_parts[index];
                        }
                    });
                }
                
                match_route = match_route.replace('+', '\\+');
                var regex = new RegExp('^#\/' + match_route + '$', 'gi');
                if(raw_hash.match(regex) !== null){
                    if(Beef.Router._activeRoute === route && data === Beef.Router._routeData){
                        return; //already active
                    }
                    Beef.Router._routeData = data;
                    Beef.Router._activeRoute = route;
                    Beef.Router.route(route, data);
                    return;
                }
            }
            Beef.Router.route('/'); //default route
        },
        
        /**
         * Go to app url
         * @param {type} url
         * @returns {undefined}
         */
        go: function(url){
            document.location = '#/' + url;
        }
    };
};