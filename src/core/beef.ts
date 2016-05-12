
import * as $ from "jquery"
import {Actions} from "../actions/actions"
import {ApiService} from "../api/api-service"
import {RoutingService} from "../routing/routing-service"
import {Store} from "../store/store"

/**
 * Handles our services, our initial setup of services, and starts the 
 * framework
 */
class Beef {
    
    protected static started : boolean = false;
    
    protected static store : Store = null;
    
    protected static Actions = function() {
        return {
            create: function(params) {
                return Actions.create(params);
            }
        };
    }
    
    protected static Api = function() {
        return ApiService;
    }
    
    protected static Store = function() {
        return Store;
    }
    
    protected static Router = function() {
        return RoutingService;
    }
}

window['Beef'] = Beef;