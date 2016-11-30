///<reference path="../../typings/index.d.ts" />

import extend = require('extend')
import _ = require('lodash')

export interface StateHistory<T>
{
    actionName : string
    state : T
}

/**
 * Store that hooks into actions
 * 
 * Store holds all data and is the only class that should modify the data,
 * anything that pulls data from the DataStore cannot modify it and should treat
 * it as immutable
 */
class Store<T>
{
    /**
     * Holds our state
     */
    protected state : T = null

    /**
     *  If state history is enabled, all state changes are saved here
     */
    protected stateHistory : StateHistory<T>[] = []
    
    /**
     * Hold our listeners, whenever the store's state changes, they will be
     * notified, and sent the new state, and old state
     */
    protected listeners : ((...any) => any)[] = []

    /**
     * Whether or not we are in debug mode
     */
    public debug : boolean = false

    constructor()
    {
        this.listen = this.listen.bind(this)
        this.ignore = this.ignore.bind(this)
        this.stateChange = this.stateChange.bind(this)
        this.newState = this.newState.bind(this)
        this.notify = this.notify.bind(this)
        this.upsertItem = this.upsertItem.bind(this)
        this.removeItem = this.removeItem.bind(this)
        this.removeItems = this.removeItems.bind(this)
    }
    
    /**
     * Listen on a given event
     */
    public listen(callback : ((...args : any[]) => any))
    {
        this.listeners.push(callback)
    }

    public getState() : T
    {
        return this.state
    }

    /**
     * Ignore an event we are listening on
     */
    public ignore(callback : ((...args : any[]) => any)) : boolean
    {
        let index = this.listeners.indexOf(callback)
        if(index >= 0) {
            this.listeners.splice(index, 1)
            return true
        }

        return false
    }

    public stateChange(actionName : string, newState : T) 
    {
        let oldState = _.cloneDeep(this.state)
        if(this.debug) {
            this.stateHistory.push({
                actionName: actionName,
                state: oldState
            })
        }
        this.state = newState
        this.notify(oldState)

        return newState
    }

    public newState() : T
    {
        return _.cloneDeep(this.state)
    }

    protected notify(oldState : T)
    {
        if(this.debug) {
            console.debug('Store state changed, notifying ' + this.listeners.length + ' listener(s) of change', 'Old State', oldState, 'New State', this.state)
        }

        this.listeners.forEach((listener) => {
            listener(this.state, oldState)
        })
    }
    
    /**
     * Insert an item into the given modelArray, update it if it already exists
     */
    public upsertItem(modelArray : any[], keyValue : any, newItem : any, overwrite : boolean = false) : boolean
    {
        var updated : boolean = false
        
        if(typeof modelArray === 'undefined' || !Array.isArray(modelArray)) {
            console.warn('Non array passed in as modelArray')
            modelArray = []
        }

        if(typeof newItem !== 'object') {
            console.warn('Upserted item must be an object', typeof newItem, 'given')
            return false
        }

        if(typeof newItem['__bID'] !== 'undefined' && newItem['__bID'] !== keyValue) {
            console.warn('Upserted item does not match the keyValue passed in', newItem['__bID'], '!=', keyValue)
            return false
        }

        let existing = null
        for(var i = 0; i < modelArray.length; i++) {
            let item = modelArray[i]
            if(item['__bID'] === keyValue) {
                existing = i
                break
            }
        }
        
        if(existing === null) {
            newItem['__bID'] = keyValue
            modelArray.push(newItem)
        } else {
            let existingItem = modelArray[existing]
            modelArray[existing] = overwrite ? newItem : this.merge(existingItem, newItem)
        }

        return true
    }
    
    /**
     * Remove an item from a modelArray
     */
    public removeItem(modelArray : any[], keyValue : any) : any[]|boolean
    {
        let existing = null
        for(var i = 0; i < modelArray.length; i++) {
            let item = modelArray[i]
            if(item['__bID'] === keyValue) {
                existing = i
                break
            }
        }

        if(existing === null) {
            return false
        }
        
        return modelArray.splice(existing, 1)
    }
    
    /**
     * Pass in an array of keyValues and remove all items that match
     */
    public removeItems(modelArray : any[], keyValues : any[]) 
    {
        keyValues.forEach((keyValue) => {
            this.removeItem(modelArray, keyValue)
        })
    }
    
    /**
     * Sanitize and valide the given object to the given schema
     */
    public sanitizeAndValidate(obj : any, schema : any)
    {
        var model = this.sanitize(obj, schema, false)
        var validation = this.validate(model, schema)

        if(validation === true) {
            return model
        }
        
        return validation
    }
    
    /**
     * Validate the given object to the given schema, will return an array
     * of errors, or true if valid
     */
    public validate(obj : any, schema : any) : any[]|boolean
    {
        var errors : string[] = []
        
        for(var field in schema) {
            if(typeof(schema[field].validation) !== 'undefined') {
                for(var validation in schema[field].validation) {
                    if(errors.length > 0) {
                        break
                    }
                    var value = obj[field]
                    
                    var label = schema[field].label ? schema[field].label : field
                    
                    switch(validation) {
                        case 'required':
                            if(typeof(value) === 'undefined' || value === null || value === '') {
                                errors.push(label + ' is required')
                            }
                        break
                        case 'minLength':
                            if(value.length < schema[field].validation[validation]) {
                                errors.push(label + ' must be at least ' + schema[field].validation[validation] + ' characters')
                            }
                        break
                        case 'maxLength':
                            if(value.length > schema[field].validation[validation]) {
                                errors.push(label + ' must be at under ' + schema[field].validation[validation] + ' characters')
                            }
                        break
                        default:
                            if(typeof(schema[field].validation[validation]) === 'function') {
                                var results = schema[field].validation[validation](value)
                                if(results !== true) {
                                    errors.concat(results)
                                }
                            }
                        break
                        
                    }
                }
            }
        }
        
        return errors.length > 0 ? errors : true
    }
    
    /**
     * Sanitize the given object to a schema, also an optional parameter if
     * you are sending the object as JSON, to format datetimes properly
     */
    public sanitize(obj : any, schema : any, json : boolean = false) : any
    {
        var clean = {}
        var tmp = extend(true, {}, obj)
        for(var field in schema) {
            clean[field] = this.sanitizeField(field, tmp, schema, json)
        }
            
        return clean
    }
    
    /**
     * Merge objects together
     */
    public merge(obj1 : any, obj2 : any) 
    {
        _.merge(obj1, obj2)

        return obj1
    }
    
    /**
     * Creates a filter sort callback to sort by a given key
     */
    public sortBy(key : string, dir : string = 'desc')
    {
        return (a, b) => {

            if((b[key] && !a[key]) || (b[key] && a[key] && b[key] > a[key])) {
                return dir.toLowerCase() === 'desc' ? 1 : -1
            }

            if((!b[key] && a[key]) || (b[key] && a[key] && b[key] < a[key])) {
                return dir.toLowerCase() === 'desc' ? -1 : 1
            }

            if(b[key] && a[key] && b[key] == a[key]) {
                return 0
            }

            if(b[key] && !a[key]) {
                return 0
            }
        }
    }
    
    /**
     * Formats a given number to two decimal places
     */
    public money(value : number)
    {
        return value.toFixed(2)
    }
    
    /**
     * Generates a UUID
     */
    public uuid()
    {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            let r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8)

            return v.toString(16)
        })
    }
    
    public static string(params = {}) 
    {
        return extend(true, {
            type: 'string'
        }, params)
    }
    
    public static int(params = {}) 
    {
        return extend(true, {
            type: 'int'
        }, params)
    }
    
    public static double(params = {}) 
    {
        return extend(true, {
            type: 'double'
        }, params)
    }
    public static bool(params = {}) 
    {
        return extend(true, {
            type: 'bool'
        }, params)
    }
    
    public static float(params = {}) 
    {
        return extend(true, {
            type: 'float'
        }, params)
    }
    
    public static array (params = {}) 
    {
        return extend(true, {
            type: 'array',
            schema: null
        }, params)
    }
    public static object (params = {}) 
    {
        return extend(true, {
            type: 'object',
            schema: null
        }, params)
    }
    
    public static datetime (params = {}) 
    {
        return extend(true, {
            type: 'datetime',
            schema: null,
            format: 'YYYY-MM-DD HH:mm:ss'
        }, params)
    }

    public static callback(params = {}) 
    {
        return extend(true, {
            type: 'callback',
            schema: null
        }, params)
    }

    public static customType(type, params = {}) 
    {
        return extend(true, {
            type: type,
            schema: null
        }, params)
    }
    
    /**
     * Sanitizes a field on an object to the given schema
     */
    protected sanitizeField(field : string, obj : any, schema : any, json : boolean)
    {
        if(schema[field].type === 'function') {
            return schema[field].value //return function
        }

        if(typeof(obj[field]) === 'undefined') {
            //see if schema has a default
            if(typeof(schema[field]['initial']) !== 'undefined') {
                obj[field] = schema[field]['initial']()
            } else {
                obj[field] = null
            }
        }
        var type = schema[field]['type']
        if(obj[field] === null && type !== 'obj' && type !== 'object') {
            return null
        }

        schema[field].field = field

        switch(type) {
            case 'int':
            case 'integer':
                return this.sanitizeInteger(obj[field], schema[field])
            case 'float':
            case 'double':
                return this.sanitizeFloat(obj[field], schema[field])
            case 'string':
            case 'char':
            case 'varchar':
                return this.sanitizeString(obj[field], schema[field])
            case 'date':
            case 'datetime':
            case 'timestamp':
                return this.sanitizeDateTime(obj[field], schema[field], json)
            case 'bool':
            case 'boolean':
                return this.sanitizeBoolean(obj[field], schema[field])
            case 'obj':
            case 'object':
                return this.sanitizeObject(obj[field], schema[field], json)
            case 'array':
            case 'collection':
                return this.sanitizeArray(obj[field], schema[field], json)
            default:
                if(schema[field].sanitize !== 'undefined') {
                    return schema[field].sanitize(obj[field], schema[field])
                }
                break
        }
    }
    
    /**
     * Sanitizes a field to an integer
     */
    protected sanitizeInteger(value : any, schemaConfig : any)
    {
        if(typeof value === 'string') {
            value = value.replace(/[a-zA-Z]+/gi, '')
            if(value.length === 0) {
                return value = ''
            }
        }

        value = parseInt(value)

        if(typeof(schemaConfig.min) !== 'undefined' && value < schemaConfig.min) {
            throw new Error('Provided value cannot be sanitized, value is below minimum integer allowed')
        }
        if(typeof(schemaConfig.max) !== 'undefined' && value > schemaConfig.max) {
            throw new Error('Provided value cannot be sanitized, value is greater than maximum integer allowed')
        }

        if(isNaN(value)) {
            return value = ''
        }

        return value
    }
    
    /**
     * Sanitizes a field to a float
     */
    protected sanitizeFloat(value : any, schemaConfig : any)
    {
        value = parseFloat(value)
        if(typeof(schemaConfig.min) !== 'undefined' && value < schemaConfig.min) {
            throw new Error('Provided value cannot be sanitized, value is below minimum float allowed')
        }

        if(typeof(schemaConfig.max) !== 'undefined' && value > schemaConfig.max) {
            throw new Error('Provided value cannot be sanitized, value is greater than maximum float allowed')
        }

        return value
    }
    
    /**
     * Sanitizes a field to a string
     */
    protected sanitizeString(value : any, schemaConfig : any)
    {
        value = String(value)
        if(typeof(schemaConfig.minLength) !== 'undefined' && value.length < schemaConfig.minLength) {
            throw new Error('Provided value cannot be sanitized, string length is below minimum allowed')
        }

        if(typeof(schemaConfig.maxLength) !== 'undefined' && value.length > schemaConfig.maxLength) {
            //truncate and do a warning
            console.warn('Value was truncated during sanitization')
            value = value.substr(0, schemaConfig.maxLength)
        }

        return value
    }
    
    /**
     * Sanitizes a field to a moment object
     */
    protected sanitizeDateTime(value : any, schemaConfig : any, json : boolean) : any
    {
        if(typeof schemaConfig.utc === 'undefined' || schemaConfig.utc) {
            var momentDate = moment.utc(value, schemaConfig.format)
        } else {
            var momentDate = moment(value, schemaConfig.format)
        }

        if(momentDate.isValid()) {
            if(json) {
                return momentDate.utc().format('YYYY-MM-DD hh:mm:ss')
            }

            return momentDate
        }

        throw new Error("Provided value ("+ value +") cannot be sanitized for field ("+ schemaConfig.field +"), is not a valid date")
    }
    
    /**
     * Sanitizes a field to boolean
     */
    protected sanitizeBoolean(value : any, schemaConfig : any)
    {
        if(value === false || value === true) {
            return value
        }

        if(typeof(value) == 'string') {

            if(value.toLowerCase().trim() === 'false') {
                return false
            }

            if(value.toLowerCase().trim() === 'true') {
                return true
            }
        }

        if(parseInt(value) === 0) {
            return false
        }

        if(parseInt(value) === 1) {
            return true
        }

        throw new Error('Provided value cannot be santized, is not a valid boolean')
    }
    
    /**
     * Sanitizes an object
     */
    protected sanitizeObject(value : any, schemaConfig : any, json : boolean)
    {
        if(typeof(schemaConfig.schema) === 'undefined') {
            throw new Error('Provided value cannot be santized, no reference schema provided for field type of object')
        }

        if(schemaConfig.schema === null) {
            return value
        }

        if(value === null) {
            return null
        }

        if(!json && typeof schemaConfig.constructor === 'function') {
            return new schemaConfig.constructor(this.sanitize(value, schemaConfig.schema()))
        }

        return this.sanitize(value, schemaConfig.schema(), json)
    }
    
    /**
     * Sanitizes an array of objects
     */
    protected sanitizeArray(value : any, schemaConfig : any, json : boolean)
    {
        if(typeof(schemaConfig.schema) === 'undefined' || schemaConfig.schema === null || schemaConfig.schema === false) {
            return value
        }

        if(typeof(value.length) === 'undefined') {
            return [] //empty array
        }


        return value.map((v) => {
            if(!json && typeof schemaConfig.constructor === 'function') {
                return new schemaConfig.constructor(this.sanitize(v, schemaConfig.schema()))
            }
            return this.sanitize(v, schemaConfig.schema(), json)
        })
    }
}

export default Store