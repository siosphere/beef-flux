"use strict";
///<reference path="../../typings/tsd.d.ts" />
var $ = require("jquery");
var moment = require("moment");
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
         * Holds all of our rows by modelType
         */
        this.rows = {};
        this.cache = {};
        this.actions = function () {
            //setup any actions
        };
    }
    Store.create = function (params) {
        var store = $.extend(true, new Store(), params);
        store.actions();
        return store;
    };
    /**
     * Listen on a given event
     */
    Store.prototype.listen = function (event, callback) {
        $(window).on(event, callback);
    };
    /**
     * Ignore an event we are listening on
     */
    Store.prototype.ignore = function (event, callback) {
        $(window).off(event, callback);
    };
    /**
     * Emit an event
     */
    Store.prototype.emit = function (event, data) {
        if (data === void 0) { data = false; }
        $(window).trigger(event, [data]);
    };
    /**
     * Insert a row if it doesn't exist, update it otherwise
     */
    Store.prototype.upsertRow = function (modelType, keyValue, newRow, overwrite) {
        if (overwrite === void 0) { overwrite = false; }
        var updated = false;
        if (typeof this.rows[modelType] === 'undefined') {
            this.rows[modelType] = [];
        }
        var rows = this.rows[modelType];
        var self = this;
        if (!this.inCache(modelType, keyValue)) {
            this.cache[modelType][keyValue] = newRow;
            this.rows[modelType].push(this.cache[modelType][keyValue]);
        }
        else {
            this.cache[modelType][keyValue] = overwrite ? newRow : self.merge(this.cache[modelType][keyValue], newRow);
        }
    };
    /**
     * Check if we have a model setup in cache
     */
    Store.prototype.inCache = function (modelType, keyValue) {
        if (typeof this.cache[modelType] === 'undefined') {
            this.cache[modelType] = {};
        }
        return typeof this.cache[modelType][keyValue] === 'object';
    };
    /**
     * Remove a row
     */
    Store.prototype.removeRow = function (modelType, keyValue) {
        if (!this.inCache(modelType, keyValue)) {
            return;
        }
        this.cache[modelType][keyValue]._deleted = true;
        this.rows[modelType] = this.rows[modelType].filter(function (row) {
            return !row._deleted;
        });
        delete this.cache[modelType][keyValue];
    };
    /**
     * Pass in an array of keyValues and remove all rows that match
     */
    Store.prototype.removeRows = function (modelType, keyValues) {
        var self = this;
        keyValues.forEach(function (keyValue) {
            self.removeRow(modelType, keyValue);
        });
    };
    /**
     * Clear our store of the given modelType
     */
    Store.prototype.clearAll = function (modelType) {
        this.rows[modelType] = [];
    };
    /**
     * Get rows of the given modelType
     */
    Store.prototype.getRows = function (modelType, noSlice) {
        if (noSlice === void 0) { noSlice = true; }
        if (typeof (this.rows[modelType]) !== 'undefined') {
            return noSlice ? this.rows[modelType] : this.rows[modelType].slice(0);
        }
        return [];
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
        var tmp = $.extend(true, {}, obj);
        for (var field in schema) {
            clean[field] = this.sanitizeField(field, tmp, schema, json);
        }
        return clean;
    };
    /**
     * Merge objects together to a given depth
     */
    Store.prototype.merge = function (obj1, obj2, depth) {
        if (depth === void 0) { depth = 1; }
        var self = this;
        if (depth === 3) {
            return obj2;
        }
        for (var p in obj2) {
            try {
                // Property in destination object set; update its value.
                if (obj2[p].constructor === Object) {
                    obj1[p] = self.merge(obj1[p], obj2[p], depth + 1);
                }
                else {
                    obj1[p] = obj2[p];
                }
            }
            catch (e) {
                // Property in destination object not set; create it and set its value.
                obj1[p] = obj2[p];
            }
        }
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
        return $.extend(true, {
            type: 'string'
        }, params);
    };
    Store.int = function (params) {
        if (params === void 0) { params = {}; }
        return $.extend(true, {
            type: 'int'
        }, params);
    };
    Store.double = function (params) {
        if (params === void 0) { params = {}; }
        return $.extend(true, {
            type: 'double'
        }, params);
    };
    Store.bool = function (params) {
        if (params === void 0) { params = {}; }
        return $.extend(true, {
            type: 'bool'
        }, params);
    };
    Store.float = function (params) {
        if (params === void 0) { params = {}; }
        return $.extend(true, {
            type: 'float'
        }, params);
    };
    Store.array = function (params) {
        if (params === void 0) { params = {}; }
        return $.extend(true, {
            type: 'array',
            schema: null
        }, params);
    };
    Store.object = function (params) {
        if (params === void 0) { params = {}; }
        return $.extend(true, {
            type: 'object',
            schema: null
        }, params);
    };
    Store.datetime = function (params) {
        if (params === void 0) { params = {}; }
        return $.extend(true, {
            type: 'datetime',
            schema: null,
            format: 'YYYY-MM-DD HH:mm:ss'
        }, params);
    };
    Store.callback = function (params) {
        if (params === void 0) { params = {}; }
        return $.extend(true, {
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
            console.warn('Value was truncated during sanitation');
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
        if (typeof (schemaConfig.schema) === 'undefined' || schemaConfig.schema === null || schemaConfig.schema === false) {
            return value;
        }
        if (typeof (value.length) === 'undefined') {
            return []; //empty array
        }
        var $me = this;
        return value.map(function (v) {
            return $me.sanitize(v, schemaConfig.schema(), json);
        });
    };
    return Store;
}());
exports.Store = Store;
