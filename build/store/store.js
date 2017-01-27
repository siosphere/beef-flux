///<reference path="../../typings/index.d.ts" />
import * as extend from 'extend';
import * as _ from 'lodash';
/**
 * Store that hooks into actions
 *
 * Store holds all data and is the only class that should modify the data,
 * anything that pulls data from the DataStore cannot modify it and should treat
 * it as immutable
 */
class Store {
    constructor() {
        /**
         * Holds our state
         */
        this.state = null;
        /**
         *  If state history is enabled, all state changes are saved here
         */
        this.stateHistory = [];
        /**
         * Hold our listeners, whenever the store's state changes, they will be
         * notified, and sent the new state, and old state
         */
        this.listeners = [];
        /**
         * Whether or not we are in debug mode
         */
        this.debug = false;
        this.listen = this.listen.bind(this);
        this.ignore = this.ignore.bind(this);
        this.stateChange = this.stateChange.bind(this);
        this.newState = this.newState.bind(this);
        this.notify = this.notify.bind(this);
        this.upsertItem = this.upsertItem.bind(this);
        this.removeItem = this.removeItem.bind(this);
        this.removeItems = this.removeItems.bind(this);
    }
    /**
     * Listen on a given event
     */
    listen(callback) {
        this.listeners.push(callback);
    }
    getState() {
        return this.state;
    }
    /**
     * Ignore an event we are listening on
     */
    ignore(callback) {
        let index = this.listeners.indexOf(callback);
        if (index >= 0) {
            this.listeners.splice(index, 1);
            return true;
        }
        return false;
    }
    stateChange(actionName, newState) {
        let oldState = _.cloneDeep(this.state);
        if (this.debug) {
            this.stateHistory.push({
                actionName: actionName,
                state: oldState
            });
        }
        this.state = newState;
        this.notify(oldState);
        return newState;
    }
    newState() {
        return _.cloneDeep(this.state);
    }
    notify(oldState) {
        if (this.debug) {
            console.debug('Store state changed, notifying ' + this.listeners.length + ' listener(s) of change', 'Old State', oldState, 'New State', this.state);
        }
        this.listeners.forEach((listener) => {
            listener(this.state, oldState);
        });
    }
    /**
     * Insert an item into the given modelArray, update it if it already exists
     */
    upsertItem(modelArray, keyValue, newItem, overwrite = false) {
        var updated = false;
        if (typeof modelArray === 'undefined' || !Array.isArray(modelArray)) {
            console.warn('Non array passed in as modelArray');
            modelArray = [];
        }
        if (typeof newItem !== 'object') {
            console.warn('Upserted item must be an object', typeof newItem, 'given');
            return false;
        }
        if (typeof newItem['__bID'] !== 'undefined' && newItem['__bID'] !== keyValue) {
            console.warn('Upserted item does not match the keyValue passed in', newItem['__bID'], '!=', keyValue);
            return false;
        }
        let existing = null;
        for (var i = 0; i < modelArray.length; i++) {
            let item = modelArray[i];
            if (item['__bID'] === keyValue) {
                existing = i;
                break;
            }
        }
        if (existing === null) {
            newItem['__bID'] = keyValue;
            modelArray.push(newItem);
        }
        else {
            let existingItem = modelArray[existing];
            modelArray[existing] = overwrite ? newItem : this.merge(existingItem, newItem);
        }
        return true;
    }
    /**
     * Remove an item from a modelArray
     */
    removeItem(modelArray, keyValue) {
        let existing = null;
        for (var i = 0; i < modelArray.length; i++) {
            let item = modelArray[i];
            if (item['__bID'] === keyValue) {
                existing = i;
                break;
            }
        }
        if (existing === null) {
            return false;
        }
        return modelArray.splice(existing, 1);
    }
    /**
     * Pass in an array of keyValues and remove all items that match
     */
    removeItems(modelArray, keyValues) {
        keyValues.forEach((keyValue) => {
            this.removeItem(modelArray, keyValue);
        });
    }
    /**
     * Sanitize and valide the given object to the given schema
     */
    sanitizeAndValidate(obj, schema) {
        var model = this.sanitize(obj, schema, false);
        var validation = this.validate(model, schema);
        if (validation === true) {
            return model;
        }
        return validation;
    }
    /**
     * Validate the given object to the given schema, will return an array
     * of errors, or true if valid
     */
    validate(obj, schema) {
        var errors = [];
        for (var field in schema) {
            if (typeof (schema[field].validation) !== 'undefined') {
                for (var validation in schema[field].validation) {
                    if (errors.length > 0) {
                        break;
                    }
                    var value = obj[field];
                    var label = schema[field].label ? schema[field].label : field;
                    switch (validation) {
                        case 'required':
                            if (typeof (value) === 'undefined' || value === null || value === '') {
                                errors.push(label + ' is required');
                            }
                            break;
                        case 'minLength':
                            if (value.length < schema[field].validation[validation]) {
                                errors.push(label + ' must be at least ' + schema[field].validation[validation] + ' characters');
                            }
                            break;
                        case 'maxLength':
                            if (value.length > schema[field].validation[validation]) {
                                errors.push(label + ' must be at under ' + schema[field].validation[validation] + ' characters');
                            }
                            break;
                        default:
                            if (typeof (schema[field].validation[validation]) === 'function') {
                                var results = schema[field].validation[validation](value);
                                if (results !== true) {
                                    errors.concat(results);
                                }
                            }
                            break;
                    }
                }
            }
        }
        return errors.length > 0 ? errors : true;
    }
    /**
     * Sanitize the given object to a schema, also an optional parameter if
     * you are sending the object as JSON, to format datetimes properly
     */
    sanitize(obj, schema, json = false) {
        var clean = {};
        var tmp = extend(true, {}, obj);
        for (var field in schema) {
            clean[field] = this.sanitizeField(field, tmp, schema, json);
        }
        return clean;
    }
    /**
     * Merge objects together
     */
    merge(obj1, obj2) {
        _.merge(obj1, obj2);
        return obj1;
    }
    /**
     * Creates a filter sort callback to sort by a given key
     */
    sortBy(key, dir = 'desc') {
        return (a, b) => {
            if ((b[key] && !a[key]) || (b[key] && a[key] && b[key] > a[key])) {
                return dir.toLowerCase() === 'desc' ? 1 : -1;
            }
            if ((!b[key] && a[key]) || (b[key] && a[key] && b[key] < a[key])) {
                return dir.toLowerCase() === 'desc' ? -1 : 1;
            }
            if (b[key] && a[key] && b[key] == a[key]) {
                return 0;
            }
            if (b[key] && !a[key]) {
                return 0;
            }
        };
    }
    /**
     * Formats a given number to two decimal places
     */
    money(value) {
        return value.toFixed(2);
    }
    /**
     * Generates a UUID
     */
    uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    static string(params = {}) {
        return extend(true, {
            type: 'string'
        }, params);
    }
    static int(params = {}) {
        return extend(true, {
            type: 'int'
        }, params);
    }
    static double(params = {}) {
        return extend(true, {
            type: 'double'
        }, params);
    }
    static bool(params = {}) {
        return extend(true, {
            type: 'bool'
        }, params);
    }
    static float(params = {}) {
        return extend(true, {
            type: 'float'
        }, params);
    }
    static array(params = {}) {
        return extend(true, {
            type: 'array',
            schema: null
        }, params);
    }
    static object(params = {}) {
        return extend(true, {
            type: 'object',
            schema: null
        }, params);
    }
    static datetime(params = {}) {
        return extend(true, {
            type: 'datetime',
            schema: null,
            format: 'YYYY-MM-DD HH:mm:ss'
        }, params);
    }
    static callback(params = {}) {
        return extend(true, {
            type: 'callback',
            schema: null
        }, params);
    }
    static customType(type, params = {}) {
        return extend(true, {
            type: type,
            schema: null
        }, params);
    }
    /**
     * Sanitizes a field on an object to the given schema
     */
    sanitizeField(field, obj, schema, json) {
        if (schema[field].type === 'function') {
            return schema[field].value; //return function
        }
        if (typeof (obj[field]) === 'undefined') {
            //see if schema has a default
            if (typeof (schema[field]['initial']) !== 'undefined') {
                obj[field] = schema[field]['initial']();
            }
            else {
                obj[field] = null;
            }
        }
        var type = schema[field]['type'];
        if (obj[field] === null && type !== 'obj' && type !== 'object') {
            return null;
        }
        schema[field].field = field;
        switch (type) {
            case 'int':
            case 'integer':
                return this.sanitizeInteger(obj[field], schema[field]);
            case 'float':
            case 'double':
                return this.sanitizeFloat(obj[field], schema[field]);
            case 'string':
            case 'char':
            case 'varchar':
                return this.sanitizeString(obj[field], schema[field]);
            case 'date':
            case 'datetime':
            case 'timestamp':
                return this.sanitizeDateTime(obj[field], schema[field], json);
            case 'bool':
            case 'boolean':
                return this.sanitizeBoolean(obj[field], schema[field]);
            case 'obj':
            case 'object':
                return this.sanitizeObject(obj[field], schema[field], json);
            case 'array':
            case 'collection':
                return this.sanitizeArray(obj[field], schema[field], json);
            case 'callback':
                return this.sanitizeCallback(obj[field], schema[field]);
            default:
                if (typeof schema[field].sanitize !== 'undefined') {
                    return schema[field].sanitize(obj[field], schema[field]);
                }
                break;
        }
    }
    sanitizeCallback(value, schemaConfig) {
        if (typeof value !== 'function') {
            throw new Error('Provided callback is not a valid function');
        }
        return value;
    }
    /**
     * Sanitizes a field to an integer
     */
    sanitizeInteger(value, schemaConfig) {
        if (typeof value === 'string') {
            value = value.replace(/[a-zA-Z]+/gi, '');
            if (value.length === 0) {
                return value = '';
            }
        }
        value = parseInt(value);
        if (typeof (schemaConfig.min) !== 'undefined' && value < schemaConfig.min) {
            throw new Error('Provided value cannot be sanitized, value is below minimum integer allowed');
        }
        if (typeof (schemaConfig.max) !== 'undefined' && value > schemaConfig.max) {
            throw new Error('Provided value cannot be sanitized, value is greater than maximum integer allowed');
        }
        if (isNaN(value)) {
            return value = '';
        }
        return value;
    }
    /**
     * Sanitizes a field to a float
     */
    sanitizeFloat(value, schemaConfig) {
        value = parseFloat(value);
        if (typeof (schemaConfig.min) !== 'undefined' && value < schemaConfig.min) {
            throw new Error('Provided value cannot be sanitized, value is below minimum float allowed');
        }
        if (typeof (schemaConfig.max) !== 'undefined' && value > schemaConfig.max) {
            throw new Error('Provided value cannot be sanitized, value is greater than maximum float allowed');
        }
        return value;
    }
    /**
     * Sanitizes a field to a string
     */
    sanitizeString(value, schemaConfig) {
        value = String(value);
        if (typeof (schemaConfig.minLength) !== 'undefined' && value.length < schemaConfig.minLength) {
            throw new Error('Provided value cannot be sanitized, string length is below minimum allowed');
        }
        if (typeof (schemaConfig.maxLength) !== 'undefined' && value.length > schemaConfig.maxLength) {
            //truncate and do a warning
            console.warn('Value was truncated during sanitization');
            value = value.substr(0, schemaConfig.maxLength);
        }
        return value;
    }
    /**
     * Sanitizes a field to a moment object
     */
    sanitizeDateTime(value, schemaConfig, json) {
        if (typeof schemaConfig.utc === 'undefined' || schemaConfig.utc) {
            var momentDate = moment.utc(value, schemaConfig.format);
        }
        else {
            var momentDate = moment(value, schemaConfig.format);
        }
        if (momentDate.isValid()) {
            if (json) {
                return momentDate.utc().format('YYYY-MM-DD hh:mm:ss');
            }
            return momentDate;
        }
        throw new Error("Provided value (" + value + ") cannot be sanitized for field (" + schemaConfig.field + "), is not a valid date");
    }
    /**
     * Sanitizes a field to boolean
     */
    sanitizeBoolean(value, schemaConfig) {
        if (value === false || value === true) {
            return value;
        }
        if (typeof (value) == 'string') {
            if (value.toLowerCase().trim() === 'false') {
                return false;
            }
            if (value.toLowerCase().trim() === 'true') {
                return true;
            }
        }
        if (parseInt(value) === 0) {
            return false;
        }
        if (parseInt(value) === 1) {
            return true;
        }
        throw new Error('Provided value cannot be santized, is not a valid boolean');
    }
    /**
     * Sanitizes an object
     */
    sanitizeObject(value, schemaConfig, json) {
        if (typeof (schemaConfig.schema) === 'undefined') {
            throw new Error('Provided value cannot be santized, no reference schema provided for field type of object');
        }
        if (schemaConfig.schema === null) {
            return value;
        }
        if (value === null) {
            return null;
        }
        if (!json && typeof schemaConfig.constructor === 'function') {
            return new schemaConfig.constructor(this.sanitize(value, schemaConfig.schema()));
        }
        return this.sanitize(value, schemaConfig.schema(), json);
    }
    /**
     * Sanitizes an array of objects
     */
    sanitizeArray(value, schemaConfig, json) {
        if (typeof (schemaConfig.schema) === 'undefined' || schemaConfig.schema === null || schemaConfig.schema === false) {
            return value;
        }
        if (typeof (value.length) === 'undefined') {
            return []; //empty array
        }
        return value.map((v) => {
            if (!json && typeof schemaConfig.constructor === 'function') {
                return new schemaConfig.constructor(this.sanitize(v, schemaConfig.schema()));
            }
            return this.sanitize(v, schemaConfig.schema(), json);
        });
    }
}
export default Store;
