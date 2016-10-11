///<reference path="../../typings/index.d.ts" />
"use strict";
var extend = require('extend');
var _ = require('lodash');
/**
 * Store that hooks into actions
 *
 * Store holds all data and is the only class that should modify the data,
 * anything that pulls data from the DataStore cannot modify it and should treat
 * it as immutable
 */
var Store = (function () {
    function Store() {
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
        this.action = this.action.bind(this);
    }
    /**
     * Listen on a given event
     */
    Store.prototype.listen = function (callback) {
        this.listeners.push(callback);
    };
    Store.prototype.getState = function () {
        return this.state;
    };
    Store.prototype.action = function (actionName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.debug) {
            console.debug('Dispatching action', actionName, args);
        }
        if (typeof this.actionListeners[actionName] === 'undefined') {
            console.warn('No action is registered for', actionName);
            return false;
        }
        return this.actionListeners[actionName].apply(this, args);
    };
    /**
     * Ignore an event we are listening on
     */
    Store.prototype.ignore = function (callback) {
        var index = this.listeners.indexOf(callback);
        if (index >= 0) {
            this.listeners.splice(index, 1);
            return true;
        }
        return false;
    };
    Store.prototype.stateChange = function (actionName, newState) {
        var oldState = _.cloneDeep(this.state);
        if (this.debug) {
            this.stateHistory.push({
                actionName: actionName,
                state: oldState
            });
        }
        this.state = newState;
        this.notify(oldState);
        return newState;
    };
    Store.prototype.newState = function () {
        return _.cloneDeep(this.state);
    };
    Store.prototype.notify = function (oldState) {
        var _this = this;
        if (this.debug) {
            console.debug('Store state changed, notifying ' + this.listeners.length + ' listener(s) of change', 'Old State', oldState, 'New State', this.state);
        }
        this.listeners.forEach(function (listener) {
            listener(_this.state, oldState);
        });
    };
    /**
     * Insert an item into the given modelArray, update it if it already exists
     */
    Store.prototype.upsertItem = function (modelArray, keyValue, newItem, overwrite) {
        if (overwrite === void 0) { overwrite = false; }
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
        var existing = null;
        for (var i = 0; i < modelArray.length; i++) {
            var item = modelArray[i];
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
            var existingItem = modelArray[existing];
            modelArray[existing] = overwrite ? newItem : this.merge(existingItem, newItem);
        }
        return true;
    };
    /**
     * Remove an item from a modelArray
     */
    Store.prototype.removeItem = function (modelArray, keyValue) {
        var existing = null;
        for (var i = 0; i < modelArray.length; i++) {
            var item = modelArray[i];
            if (item['__bID'] === keyValue) {
                existing = i;
                break;
            }
        }
        if (existing === null) {
            return false;
        }
        return modelArray.splice(existing, 1);
    };
    /**
     * Pass in an array of keyValues and remove all items that match
     */
    Store.prototype.removeItems = function (modelArray, keyValues) {
        var _this = this;
        keyValues.forEach(function (keyValue) {
            _this.removeItem(modelArray, keyValue);
        });
    };
    /**
     * Sanitize and valide the given object to the given schema
     */
    Store.prototype.sanitizeAndValidate = function (obj, schema) {
        var model = this.sanitize(obj, schema, false);
        var validation = this.validate(model, schema);
        if (validation === true) {
            return model;
        }
        return validation;
    };
    /**
     * Validate the given object to the given schema, will return an array
     * of errors, or true if valid
     */
    Store.prototype.validate = function (obj, schema) {
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
    };
    /**
     * Sanitize the given object to a schema, also an optional parameter if
     * you are sending the object as JSON, to format datetimes properly
     */
    Store.prototype.sanitize = function (obj, schema, json) {
        if (json === void 0) { json = false; }
        var clean = {};
        var tmp = extend(true, {}, obj);
        for (var field in schema) {
            clean[field] = this.sanitizeField(field, tmp, schema, json);
        }
        return clean;
    };
    /**
     * Merge objects together
     */
    Store.prototype.merge = function (obj1, obj2) {
        _.merge(obj1, obj2);
        return obj1;
    };
    /**
     * Creates a filter sort callback to sort by a given key
     */
    Store.prototype.sortBy = function (key, dir) {
        if (dir === void 0) { dir = 'desc'; }
        return function (a, b) {
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
    };
    /**
     * Formats a given number to two decimal places
     */
    Store.prototype.money = function (value) {
        return value.toFixed(2);
    };
    /**
     * Generates a UUID
     */
    Store.prototype.uuid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    Store.string = function (params) {
        if (params === void 0) { params = {}; }
        return extend(true, {
            type: 'string'
        }, params);
    };
    Store.int = function (params) {
        if (params === void 0) { params = {}; }
        return extend(true, {
            type: 'int'
        }, params);
    };
    Store.double = function (params) {
        if (params === void 0) { params = {}; }
        return extend(true, {
            type: 'double'
        }, params);
    };
    Store.bool = function (params) {
        if (params === void 0) { params = {}; }
        return extend(true, {
            type: 'bool'
        }, params);
    };
    Store.float = function (params) {
        if (params === void 0) { params = {}; }
        return extend(true, {
            type: 'float'
        }, params);
    };
    Store.array = function (params) {
        if (params === void 0) { params = {}; }
        return extend(true, {
            type: 'array',
            schema: null
        }, params);
    };
    Store.object = function (params) {
        if (params === void 0) { params = {}; }
        return extend(true, {
            type: 'object',
            schema: null
        }, params);
    };
    Store.datetime = function (params) {
        if (params === void 0) { params = {}; }
        return extend(true, {
            type: 'datetime',
            schema: null,
            format: 'YYYY-MM-DD HH:mm:ss'
        }, params);
    };
    Store.callback = function (params) {
        if (params === void 0) { params = {}; }
        return extend(true, {
            type: 'callback',
            schema: null
        }, params);
    };
    /**
     * Sanitizes a field on an object to the given schema
     */
    Store.prototype.sanitizeField = function (field, obj, schema, json) {
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
            default:
                if (schema[field].sanitize !== 'undefined') {
                    return schema[field].sanitize(obj[field], schema[field]);
                }
                break;
        }
    };
    /**
     * Sanitizes a field to an integer
     */
    Store.prototype.sanitizeInteger = function (value, schemaConfig) {
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
    };
    /**
     * Sanitizes a field to a float
     */
    Store.prototype.sanitizeFloat = function (value, schemaConfig) {
        value = parseFloat(value);
        if (typeof (schemaConfig.min) !== 'undefined' && value < schemaConfig.min) {
            throw new Error('Provided value cannot be sanitized, value is below minimum float allowed');
        }
        if (typeof (schemaConfig.max) !== 'undefined' && value > schemaConfig.max) {
            throw new Error('Provided value cannot be sanitized, value is greater than maximum float allowed');
        }
        return value;
    };
    /**
     * Sanitizes a field to a string
     */
    Store.prototype.sanitizeString = function (value, schemaConfig) {
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
    };
    /**
     * Sanitizes a field to a moment object
     */
    Store.prototype.sanitizeDateTime = function (value, schemaConfig, json) {
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
    };
    /**
     * Sanitizes a field to boolean
     */
    Store.prototype.sanitizeBoolean = function (value, schemaConfig) {
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
    };
    /**
     * Sanitizes an object
     */
    Store.prototype.sanitizeObject = function (value, schemaConfig, json) {
        if (typeof (schemaConfig.schema) === 'undefined') {
            throw new Error('Provided value cannot be santized, no reference schema provided for field type of object');
        }
        if (schemaConfig.schema === null) {
            return value;
        }
        if (value === null) {
            return null;
        }
        return this.sanitize(value, schemaConfig.schema(), json);
    };
    /**
     * Sanitizes an array of objects
     */
    Store.prototype.sanitizeArray = function (value, schemaConfig, json) {
        var _this = this;
        if (typeof (schemaConfig.schema) === 'undefined' || schemaConfig.schema === null || schemaConfig.schema === false) {
            return value;
        }
        if (typeof (value.length) === 'undefined') {
            return []; //empty array
        }
        return value.map(function (v) {
            return _this.sanitize(v, schemaConfig.schema(), json);
        });
    };
    return Store;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Store;