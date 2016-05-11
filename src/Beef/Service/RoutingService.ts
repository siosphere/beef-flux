/**
 * Will match a given url to a route, and execute a function/callback defined
 * for that route. Will also parse the URL for different parameters and
 * pass that into the callback if found
 */
class RoutingService 
{
    public static SERVICE_ID : string = 'beef.service.routing';
    protected routingConfig : RoutingConfig;
    
    protected activeRoute : string;
    
    protected routeData : any;
    
    protected lastResponse : any;
    
    public onRouteFinished() {
        
    }
    
    public routes(routes : any)
    {
        this.routingConfig = new RoutingConfig(routes);
        
        return this;
    }
    
    public route (url : string, data : any)
    {
        var isRoute = this.routingConfig.isRoute(url);
        if(!isRoute) {
            url = '/';
        }
        
        if(this.routingConfig.isRoute(url)) {
            var response = this.routingConfig.callRoute(url, data);
            this.activeRoute = url;
            this.onRouteFinished();
            return response;
        }
        
        return null;
    }
    
    public doRouting(rawHash : string = null)
    {
        var matchRoute = '';
        
        for(var rawRoute in this.routingConfig.routes){
            matchRoute = rawRoute;
            rawHash = rawHash !== null ? rawHash : window.location.hash;
            if (rawHash.indexOf('?') >= 0) {
                rawHash = rawHash.substring(0, rawHash.indexOf('?'));
            }
            var res = rawRoute.match(/\{[a-z\_\-\+]+\}/gi);
            
            var data = {};
            
            if(res !== null){
                var routeParts = rawRoute.split('/');
                var hashParts = rawHash.split('/');
                hashParts = hashParts.splice(1, hashParts.length - 1);

                if(hashParts.length !== routeParts.length){
                    continue;
                }

                var i = 0;
                var bError = false;

                hashParts.forEach(function(part){
                    if(!routeParts[i].match(/\{[a-z\_\-\+]+\}/gi)){
                        if(part !== routeParts[i]){
                            bError = true;
                        }
                    }
                    i++;
                });

                if(bError){
                    continue;
                }


                //reset the match route for regex
                matchRoute = '';
                routeParts.forEach(function(part, index){
                    if(index > 0){
                        matchRoute += '/';
                    }
                    matchRoute += hashParts[index];
                    if(index > 0){
                        data[part.replace(/[\{\}]/gi, '')] = hashParts[index];
                    }
                });
            }
            
            matchRoute = matchRoute.replace('+', '\\+');
            var regex = new RegExp('^#\/' + matchRoute + '$', 'gi');
            if(rawHash.match(regex) !== null){
                if(this.activeRoute === rawRoute && data === this.routeData){
                    return this.lastResponse; //already active
                }
                this.routeData = data;
                this.activeRoute = rawRoute;
                return this.lastResponse = this.route(rawRoute, data);
            }
        }
        
        return this.lastResponse = this.route('/', {}); //default route
    }
}