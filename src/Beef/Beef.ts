/**
 * Handles our services, our initial setup of services, and starts the 
 * framework
 */
class Beef {
    
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
        this.setupCallbacks.forEach(function(callback) {
            callback();
        });
    }
}