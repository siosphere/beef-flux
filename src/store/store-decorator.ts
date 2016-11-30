import Store from "./store"

/**
 * This is used to build a schema from a typescript class without having to
 * redefine all the fields.
 * 
 * Usage:
 * 
 * class MyAwesomeObject
 * {
 *     public static schema = {}
 *     
 *     @Schema.int()
 *     myAwesomeField : number
 *     
 *     @Schema.object({
 *         schema: () => {
 *             return SomeOtherObject.schema
 *         }
 *     })
 *     myAwesomeObject : any
 * }
 */
export let Schema = {
    
    int: function(config : any = null) {
        return setupFunction.bind(null, Store.int.bind(null, config));
    },
    
    string: function(config : any = null) {
        return setupFunction.bind(null, Store.string.bind(null, config));
    },
    
    double: function(config : any = null) {
        return setupFunction.bind(null, Store.double.bind(null, config));
    },
    
    bool: function(config : any = null) {
        return setupFunction.bind(null, Store.bool.bind(null, config));
    },
    
    float: function(config : any = null) {
        return setupFunction.bind(null, Store.float.bind(null, config));
    },
    
    array: function(config : any = null) {
        return setupFunction.bind(null, Store.array.bind(null, config));
    },
    
    object: function(config : any = null) {
        return setupFunction.bind(null, Store.object.bind(null, config));
    },
    
    datetime: function(config : any = null) {
        return setupFunction.bind(null, Store.datetime.bind(null, config));
    },
    
    callback: function(config : any = null) {
        return setupFunction.bind(null, Store.callback.bind(null, config));
    },

    custom: function(type, config : any = null) {
        return setupFunction.bind(null, Store.customType.bind(null, type, config));
    },
    
    uuid: function(config : any = {}) {
        
        config.initial = function() {
            return uuid();
        }
        
        return setupFunction.bind(null, Store.string.bind(null, config));
    }
}

var setupFunction = function (storeCallback : any, target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    
    target.constructor.schema[propertyKey] = storeCallback();
}


var uuid = function()
{
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}