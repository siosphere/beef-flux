var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../../../lib/jquery.d.ts" />
/// <reference path="../../../lib/moment.d.ts" /> 
/**
 * Handles our services, our initial setup of services, and starts the
 * framework
 */
var Beef = (function () {
    function Beef() {
    }
    Beef.service = function (serviceId, service) {
        if (service === void 0) { service = null; }
        if (service !== null) {
            this.services[serviceId] = service;
        }
        return this.services[serviceId];
    };
    Beef.setup = function (callback) {
        this.setupCallbacks.push(callback);
    };
    Beef.start = function () {
        if (this.started) {
            return;
        }
        this.setupCallbacks.forEach(function (callback) {
            callback();
        });
        this.started = true;
    };
    Beef.started = false;
    Beef.Actions = function () {
        Beef.start();
        return {
            create: function (params) {
                return Actions.create(params);
            }
        };
    };
    Beef.Api = function () {
        Beef.start();
        return Beef.service(ApiService.SERVICE_ID);
    };
    Beef.Dispatcher = function () {
        Beef.start();
        return Beef.service(Dispatcher.SERVICE_ID);
    };
    Beef.Store = function () {
        Beef.start();
        return {
            create: function (params) {
                var store = $.extend(true, new Store(), params);
                store.actions();
                return store;
            }
        };
    };
    Beef.Router = function () {
        Beef.start();
        return Beef.service(RoutingService.SERVICE_ID);
    };
    Beef.services = {};
    Beef.setupCallbacks = [];
    return Beef;
}());
/**
 * Used to create an application
 * TODO: setup
 */
var BaseApp = (function () {
    function BaseApp() {
    }
    BaseApp.prototype.setup = function () {
    };
    BaseApp.prototype.run = function () {
    };
    return BaseApp;
}());
/**
 * All services should extend from this class
 */
var BaseService = (function () {
    function BaseService() {
    }
    return BaseService;
}());
/**
 * Store that hooks into actions dispatched by a Dispatcher
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
        this.actions = function () {
            //setup any actions
        };
        /**
         * When registering a dispatcher, this becomes our callback index used
         * for dependency resolution
         */
        this.dispatchIndex = null;
    }
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
    Store.prototype.upsertRow = function (modelType, keyField, keyValue, newRow, overwrite) {
        if (overwrite === void 0) { overwrite = false; }
        var updated = false;
        if (typeof (this.rows[modelType]) === 'undefined') {
            this.rows[modelType] = [];
        }
        var rows = this.rows[modelType];
        var self = this;
        rows.forEach(function (row, index) {
            if (typeof (row[keyField]) !== 'undefined' && row[keyField] === keyValue) {
                if (typeof (rows[index]) === 'undefined') {
                    rows[index] = {};
                }
                rows[index] = overwrite ? rows[index] = newRow : self.merge(rows[index], newRow);
                updated = true;
            }
        });
        if (!updated) {
            this.rows[modelType].push(newRow);
        }
    };
    /**
     * Remove a row
     */
    Store.prototype.removeRow = function (modelType, keyField, keyValue) {
        if (typeof (this.rows[modelType]) === 'undefined') {
            return;
        }
        var rows = this.rows[modelType];
        var indexes = [];
        rows.forEach(function (row, index) {
            if (typeof (row[keyField]) !== 'undefined' && row[keyField] == keyValue) {
                indexes.push(index);
            }
        });
        if (indexes.length === 0) {
            return;
        }
        for (var i = 0; i < indexes.length; i++) {
            this.rows[modelType].splice(indexes[i], 1);
        }
    };
    /**
     * Pass in an array of keyValues and remove all rows that match
     */
    Store.prototype.removeRows = function (modelType, keyField, keyValues) {
        var self = this;
        keyValues.forEach(function (keyValue) {
            self.removeRow(modelType, keyField, keyValue);
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
        var tmp = jQuery.extend(true, {}, obj);
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
        if (moment(value, schemaConfig.format).isValid()) {
            if (json) {
                return moment(value).utc().format('YYYY-MM-DD hh:mm:ss');
            }
            if (typeof schemaConfig.utc === 'undefined' || schemaConfig.utc) {
                return moment.utc(value);
            }
            return moment(value);
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
    /**
     * Gets the dispatcher
     */
    Store.prototype.getDispatcher = function () {
        return Beef.service(Dispatcher.SERVICE_ID);
    };
    return Store;
}());
/**
 * An action will store callbacks that apply to actionTypes it can dispatch,
 */
var Action = (function () {
    function Action() {
        this._callbacks = {};
    }
    /**
     * Register functions to actions we may contain,
     * Params should be an object where the "key" is the function that should
     * be called on "scope" when the params[key] action takes place
     */
    Action.prototype._register = function (params, scope) {
        for (var key in params) {
            var actionName = params[key].name ? params[key].name : params[key].toString().match(/^function\s*([^\s(]+)/)[1];
            if (typeof this._callbacks[actionName] === 'undefined') {
                this._callbacks[actionName] = [];
            }
            this._callbacks[actionName].push(scope[key].bind(scope));
        }
    };
    /**
     * Internal function used to dispatch a message when an action is called
     */
    Action.prototype._dispatch = function (actionName, fn, args) {
        if (typeof this._callbacks[actionName] === 'undefined') {
            return;
        }
        var data = fn.apply(this, args);
        this._callbacks[actionName].forEach(function (callback) {
            callback(data);
        });
    };
    return Action;
}());
/**
 * Used to create actions that can be dispatched to stores.
 *
 * Usage:
 *
 * class TodoActionsClass extends Action {
 *
 *   receiveTodos(todos : any[])
 *   {
 *       return todos;
 *   }
 * };
 *
 * var TodoActions : TodoActionsClass = Actions.create(new TodoActionsClass());
 *
 *
 * Listening on a store:
 *
 * TodoActions._register({
 *     receiveTodos: TodoActions.receiveTodos
 * }, this);
 *
 * Each action should return the value that will be sent to the callbacks
 * listening on this action
 */
var Actions = (function () {
    function Actions() {
    }
    /**
     * Create the action
     */
    Actions.create = function (params) {
        var action = new Action();
        for (var key in params) {
            if (key[0] === '_' || Actions.ignoreFunctions.indexOf(key) >= 0) {
                continue;
            }
            action[key] = new function () {
                return (new Function("return function (fn) { return function " + key +
                    " () { return fn(this, arguments) }; };")())(Function.apply.bind(function (key) {
                    var args = [];
                    for (var i in arguments) {
                        if (i === "0") {
                            continue;
                        }
                        args.push(arguments[i]);
                    }
                    action._dispatch(key, params[key].bind(action), args);
                }.bind(null, key)));
            };
        }
        return action;
    };
    Actions.ignoreFunctions = ['constructor'];
    return Actions;
}());
;
/**
 * Holds a dispatcher callback function, with dependencies (array of dispatchIds)
 * that need to be called before this callback will fire. Also holds its
 * dispatchId
 */
var DispatcherCallback = (function () {
    function DispatcherCallback(func, dependencies, dispatchId) {
        if (dependencies === void 0) { dependencies = []; }
        this.func = func;
        this.dependencies = dependencies;
        this.dispatchId = dispatchId;
    }
    return DispatcherCallback;
}());
;
/**
 * The payload that will be sent to the dispatch callback
 */
var DispatcherPayload = (function () {
    function DispatcherPayload(action, data) {
        this.action = action;
        this.data = data;
    }
    return DispatcherPayload;
}());
/**
 * Holds routes (an object with 'url/pattern': function())
 */
var RoutingConfig = (function () {
    function RoutingConfig(routes) {
        this.routes = routes;
    }
    RoutingConfig.prototype.isRoute = function (url) {
        return typeof this.routes[url] !== 'undefined';
    };
    RoutingConfig.prototype.callRoute = function (url, data) {
        return this.routes[url](data);
    };
    return RoutingConfig;
}());
/**
 * Wrapper to create a consistent sdk for doing XHR requests. Will
 * automatically replace matching variables in urls that match the pattern.
 * i.e/ /my/url/{someId}/ { someId: 1 } = /my/url/1/
 */
var ApiService = (function (_super) {
    __extends(ApiService, _super);
    function ApiService() {
        _super.apply(this, arguments);
    }
    ApiService.prototype.throttle = function (func, wait, immediate) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate)
                    func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow)
                func.apply(context, args);
        };
    };
    ApiService.prototype.get = function (url, data) {
        return $.ajax({
            url: this._buildUrl(url, data),
            method: "GET",
            dataType: 'json'
        });
    };
    ApiService.prototype.post = function (url, data) {
        return $.ajax({
            url: this._buildUrl(url, data, false),
            data: JSON.stringify(data),
            method: "POST",
            dataType: 'json'
        });
    };
    ApiService.prototype.put = function (url, data) {
        return $.ajax({
            url: this._buildUrl(url, data, false),
            data: JSON.stringify(data),
            method: "PUT",
            dataType: 'json'
        });
    };
    ApiService.prototype['delete'] = function (url, data) {
        return $.ajax({
            url: this._buildUrl(url, data),
            method: "DELETE",
            dataType: 'json'
        });
    };
    ApiService.prototype._buildUrl = function (url, data, queryString) {
        if (queryString === void 0) { queryString = true; }
        //build the url
        for (var i in data) {
            //check if URL requires data, and if provided, replace in URL.
            if (url.indexOf('{' + i + '}') !== -1) {
                url = url.replace('{' + i + '}', data[i]);
                continue;
            }
            if (queryString === false) {
                continue;
            }
            if (url.indexOf('?') !== -1) {
                url += '&';
            }
            else {
                url += '?';
            }
            url += i + '=' + data[i];
        }
        return url;
    };
    ApiService.SERVICE_ID = 'beef.service.api';
    return ApiService;
}(BaseService));
/**
 * Used to dispatch messages to any registered listeners
 */
var Dispatcher = (function (_super) {
    __extends(Dispatcher, _super);
    function Dispatcher() {
        _super.apply(this, arguments);
        this.maxIterations = 10;
        this.callbacks = [];
    }
    Dispatcher.prototype.register = function (callback, dependencies) {
        var dispatchId = this.callbacks.length;
        this.callbacks.push(new DispatcherCallback(callback, dependencies, dispatchId));
        return dispatchId;
    };
    Dispatcher.prototype.dispatch = function (action, data) {
        var payload = new DispatcherPayload(action, data);
        var success = [];
        var i = 0;
        var index = 0;
        while (i < this.maxIterations && success.length < this.callbacks.length) {
            if (index >= this.callbacks.length) {
                index = 0;
                i++;
            }
            var callback = this.callbacks[index];
            if (success.filter(function (dispatch_index) {
                return callback.dependencies.indexOf(dispatch_index) !== -1;
            }).length !== callback.dependencies.length) {
                continue; //waiting on a dependency
            }
            callback.func(payload);
            success.push(callback.dispatchId);
            index++;
        }
        if (i >= this.maxIterations) {
            console.warn('Hit max dispatcher iterations, check dependencies of callbacks');
        }
    };
    Dispatcher.SERVICE_ID = 'beef.service.dispatcher';
    return Dispatcher;
}(BaseService));
/**
 * Will match a given url to a route, and execute a function/callback defined
 * for that route. Will also parse the URL for different parameters and
 * pass that into the callback if found
 */
var RoutingService = (function () {
    function RoutingService() {
    }
    RoutingService.prototype.onRouteFinished = function () {
    };
    RoutingService.prototype.routes = function (routes) {
        this.routingConfig = new RoutingConfig(routes);
        return this;
    };
    RoutingService.prototype.route = function (url, data) {
        var isRoute = this.routingConfig.isRoute(url);
        if (!isRoute) {
            url = '/';
        }
        if (this.routingConfig.isRoute(url)) {
            var response = this.routingConfig.callRoute(url, data);
            this.activeRoute = url;
            this.onRouteFinished();
            return response;
        }
        return null;
    };
    RoutingService.prototype.doRouting = function (rawHash) {
        if (rawHash === void 0) { rawHash = null; }
        var matchRoute = '';
        for (var rawRoute in this.routingConfig.routes) {
            matchRoute = rawRoute;
            rawHash = rawHash !== null ? rawHash : window.location.hash;
            if (rawHash.indexOf('?') >= 0) {
                rawHash = rawHash.substring(0, rawHash.indexOf('?'));
            }
            var res = rawRoute.match(/\{[a-z\_\-\+]+\}/gi);
            var data = {};
            if (res !== null) {
                var routeParts = rawRoute.split('/');
                var hashParts = rawHash.split('/');
                hashParts = hashParts.splice(1, hashParts.length - 1);
                if (hashParts.length !== routeParts.length) {
                    continue;
                }
                var i = 0;
                var bError = false;
                hashParts.forEach(function (part) {
                    if (!routeParts[i].match(/\{[a-z\_\-\+]+\}/gi)) {
                        if (part !== routeParts[i]) {
                            bError = true;
                        }
                    }
                    i++;
                });
                if (bError) {
                    continue;
                }
                //reset the match route for regex
                matchRoute = '';
                routeParts.forEach(function (part, index) {
                    if (index > 0) {
                        matchRoute += '/';
                    }
                    matchRoute += hashParts[index];
                    if (index > 0) {
                        data[part.replace(/[\{\}]/gi, '')] = hashParts[index];
                    }
                });
            }
            matchRoute = matchRoute.replace('+', '\\+');
            var regex = new RegExp('^#\/' + matchRoute + '$', 'gi');
            if (rawHash.match(regex) !== null) {
                if (this.activeRoute === rawRoute && data === this.routeData) {
                    return this.lastResponse; //already active
                }
                this.routeData = data;
                this.activeRoute = rawRoute;
                return this.lastResponse = this.route(rawRoute, data);
            }
        }
        return this.lastResponse = this.route('/', {}); //default route
    };
    RoutingService.SERVICE_ID = 'beef.service.routing';
    return RoutingService;
}());
/// <reference path="../Beef.ts" />
/// <reference path="../Component/BaseApp.ts" />
/// <reference path="../Component/BaseService.ts" />
/// <reference path="../Component/Store.ts" />
/// <reference path="../Component/Actions/Action.ts" />
/// <reference path="../Component/Actions.ts" />
/// <reference path="../Component/Dispatcher/Callback.ts" />
/// <reference path="../Component/Dispatcher/Payload.ts" />
/// <reference path="../Component/Routing/Config.ts" />
/// <reference path="../Service/ApiService.ts" />
/// <reference path="../Service/Dispatcher.ts" />
/// <reference path="../Service/RoutingService.ts" />
/**
 * Register our services
 */
Beef.setup(function () {
    Beef.service(ApiService.SERVICE_ID, new ApiService());
    Beef.service(Dispatcher.SERVICE_ID, new Dispatcher());
    Beef.service(RoutingService.SERVICE_ID, new RoutingService());
});
