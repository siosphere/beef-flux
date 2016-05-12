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
        this.setupCallbacks.forEach(function (callback) {
            callback();
        });
    };
    Beef.services = {};
    Beef.setupCallbacks = [];
    return Beef;
})();
var BaseApp = (function () {
    function BaseApp() {
    }
    BaseApp.prototype.setup = function () {
    };
    BaseApp.prototype.run = function () {
    };
    return BaseApp;
})();
var BaseService = (function () {
    function BaseService() {
    }
    return BaseService;
})();
var Store = (function () {
    function Store() {
        this.rows = {};
        this.dispatchIndex = null;
    }
    Store.create = function (params) {
        var store = new Store();
        return $.extend(store, params);
    };
    Store.prototype.listen = function (event, callback) {
        $(window).on(event, callback);
    };
    Store.prototype.ignore = function (event, callback) {
        $(window).off(event, callback);
    };
    Store.prototype.emit = function (event, data) {
        if (data === void 0) { data = false; }
        $(window).trigger(event, [data]);
    };
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
    Store.prototype.removeRows = function (modelType, keyField, keyValues) {
        var self = this;
        keyValues.forEach(function (keyValue) {
            self.removeRow(modelType, keyField, keyValue);
        });
    };
    Store.prototype.clearAll = function (modelType) {
        this.rows[modelType] = [];
    };
    Store.prototype.getRows = function (modelType, noSlice) {
        if (noSlice === void 0) { noSlice = true; }
        if (typeof (this.rows[modelType]) !== 'undefined') {
            return noSlice ? this.rows[modelType] : this.rows[modelType].slice(0);
        }
        return [];
    };
    Store.prototype.sanitizeAndValidate = function (obj, schema) {
        var model = this.sanitize(obj, schema, false);
        var validation = this.validate(model, schema);
        if (validation === true) {
            return model;
        }
        return validation;
    };
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
    Store.prototype.sanitize = function (obj, schema, json) {
        if (json === void 0) { json = false; }
        var clean = {};
        var tmp = jQuery.extend(true, {}, obj);
        for (var field in schema) {
            clean[field] = this.sanitizeField(field, tmp, schema, json);
        }
        return clean;
    };
    Store.prototype.merge = function (obj1, obj2, depth) {
        if (depth === void 0) { depth = 1; }
        var self = this;
        if (depth === 3) {
            return obj2;
        }
        for (var p in obj2) {
            try {
                if (obj2[p].constructor === Object) {
                    obj1[p] = self.merge(obj1[p], obj2[p], depth + 1);
                }
                else {
                    obj1[p] = obj2[p];
                }
            }
            catch (e) {
                obj1[p] = obj2[p];
            }
        }
        return obj1;
    };
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
    Store.prototype.money = function (value) {
        return value.toFixed(2);
    };
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
    Store.prototype.sanitizeField = function (field, obj, schema, json) {
        if (schema[field].type === 'function') {
            return schema[field].value;
        }
        if (typeof (obj[field]) === 'undefined') {
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
    Store.prototype.sanitizeString = function (value, schemaConfig) {
        value = String(value);
        if (typeof (schemaConfig.minLength) !== 'undefined' && value.length < schemaConfig.minLength) {
            throw new Error('Provided value cannot be sanitized, string length is below minimum allowed');
        }
        if (typeof (schemaConfig.maxLength) !== 'undefined' && value.length > schemaConfig.maxLength) {
            console.warn('Value was truncated during sanitation');
            value = value.substr(0, schemaConfig.maxLength);
        }
        return value;
    };
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
    Store.prototype.sanitizeArray = function (value, schemaConfig, json) {
        if (typeof (schemaConfig.schema) === 'undefined' || schemaConfig.schema === null || schemaConfig.schema === false) {
            return value;
        }
        if (typeof (value.length) === 'undefined') {
            return [];
        }
        var $me = this;
        return value.map(function (v) {
            return $me.sanitize(v, schemaConfig.schema(), json);
        });
    };
    Store.prototype.getDispatcher = function () {
        return Beef.service(Dispatcher.SERVICE_ID);
    };
    return Store;
})();
var Action = (function () {
    function Action() {
        this._callbacks = {};
    }
    Action.prototype._register = function (params, scope) {
        for (var key in params) {
            var actionName = params[key].name;
            if (typeof this._callbacks[actionName] === 'undefined') {
                this._callbacks[actionName] = [];
            }
            this._callbacks[actionName].push(scope[key].bind(scope));
        }
    };
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
})();
var Actions = (function () {
    function Actions() {
    }
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
})();
;
var DispatcherCallback = (function () {
    function DispatcherCallback(func, dependencies, dispatchId) {
        if (dependencies === void 0) { dependencies = []; }
        this.func = func;
        this.dependencies = dependencies;
        this.dispatchId = dispatchId;
    }
    return DispatcherCallback;
})();
;
var DispatcherPayload = (function () {
    function DispatcherPayload(action, data) {
        this.action = action;
        this.data = data;
    }
    return DispatcherPayload;
})();
var RoutingConfig = (function () {
    function RoutingConfig(routes) {
        this.routes = routes;
    }
    RoutingConfig.prototype.isRoute = function (url) {
        return typeof (this.routes[url]) !== 'undefined';
    };
    RoutingConfig.prototype.callRoute = function (url, data) {
        this.routes[url](data);
    };
    return RoutingConfig;
})();
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
            data: JSON.stringify(data),
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
            data: JSON.stringify(data),
            method: "DELETE",
            dataType: 'json'
        });
    };
    ApiService.prototype._buildUrl = function (url, data, queryString) {
        if (queryString === void 0) { queryString = true; }
        for (var i in data) {
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
})(BaseService);
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
                continue;
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
})(BaseService);
var RoutingService = (function () {
    function RoutingService() {
    }
    RoutingService.prototype.onRouteFinished = function () {
    };
    RoutingService.prototype.routes = function (routes) {
        this.routingConfig = new RoutingConfig(routes);
    };
    RoutingService.prototype.route = function (url, data) {
        if (this.routingConfig.isRoute(url)) {
            this.routingConfig.callRoute(url, data);
            this.activeRoute = url;
            this.onRouteFinished();
        }
    };
    RoutingService.prototype.doRouting = function () {
        var matchRoute = '';
        for (var rawRoute in this.routingConfig.routes) {
            matchRoute = rawRoute;
            var rawHash = window.location.hash;
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
                    return;
                }
                this.routeData = data;
                this.activeRoute = rawRoute;
                this.route(rawRoute, data);
                return;
            }
        }
        this.route('/', {});
    };
    RoutingService.SERVICE_ID = 'beef.service.routing';
    return RoutingService;
})();
Beef.setup(function () {
    Beef.service(ApiService.SERVICE_ID, new ApiService());
    Beef.service(Dispatcher.SERVICE_ID, new Dispatcher());
    Beef.service(RoutingService.SERVICE_ID, new RoutingService());
});
var TodoActionsClass = (function (_super) {
    __extends(TodoActionsClass, _super);
    function TodoActionsClass() {
        _super.apply(this, arguments);
    }
    TodoActionsClass.prototype.receiveTodos = function (todos) {
        return todos;
    };
    return TodoActionsClass;
})(Action);
;
var TodoActions = Actions.create(new TodoActionsClass());
