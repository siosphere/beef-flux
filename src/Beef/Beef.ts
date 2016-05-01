/**
 * Handles our services, our initial setup of services, and starts the 
 * framework
 */
class Beef {
    protected static started : boolean = false;
    
    protected static Actions = function() {
        Beef.start();
        return {
            create: function(params) {
                return Actions.create(params);
            }
        };
    }
    
    protected static Api = function() {
        Beef.start();
        return Beef.service(ApiService.SERVICE_ID);
    }
    
    protected static Dispatcher = function() {
        Beef.start();
        return Beef.service(Dispatcher.SERVICE_ID);
    }
    
    protected static Store = function() {
        Beef.start();
        return {
            create: function(params) {
                var store = $.extend(true, new Store(), params);
                store.actions();
                return store;
            }
        };
    }
    
    protected static Router = function() {
        Beef.start();
        return Beef.service(RoutingService.SERVICE_ID);
    }
    
    protected static services:any = {};
    
    protected static setupCallbacks : (() => any)[] = [];
    
    public static service(serviceId : string, service : BaseService = null) {
        if(service !== null) {
            this.services[serviceId] = service;
        }
        
        return this.services[serviceId];
    }
    
    public static setup(callback : () => any) {
        this.setupCallbacks.push(callback);
    }
    
    public static start() {
        if(this.started) {
            return;
        }
        
        this.setupCallbacks.forEach(function(callback) {
            callback();
        });
        
        this.started = true;
    }
}