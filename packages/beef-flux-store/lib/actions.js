"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var base_store_1 = require("./base-store");
var Actions = /** @class */ (function () {
    function Actions() {
        var _this = this;
        this.actions = {};
        this.define = this.define.bind(this);
        this.dispatch = this.dispatch.bind(this);
        this.register = this.register.bind(this);
        this.debug = false;
        Object.getOwnPropertyNames(Object.getPrototypeOf(this)).forEach(function (property) {
            if (property === 'constructor' || property.indexOf('__') === 0) {
                return;
            }
            if (typeof _this[property] !== 'function') {
                return;
            }
            _this[property] = _this.define(property, _this[property]);
        });
    }
    Actions.prototype.setDebug = function (debug) {
        this.debug = debug;
        return this;
    };
    Actions.prototype.define = function (actionName, cb) {
        if (typeof actionName !== 'string') {
            console.error("actionName is not a valid string", actionName);
        }
        if (typeof cb !== 'function') {
            console.error("Must pass valid callback for action: ", cb);
        }
        if (typeof this.actions[actionName] !== 'undefined') {
            console.warn('Action with name ' + actionName + ' was already defined, and is now being overwritten');
        }
        this.actions[actionName] = {
            cb: cb,
            stores: []
        };
        var override = function () {
            this.dispatch(actionName, arguments);
        };
        override = override.bind(this);
        override.toString = function () {
            return actionName;
        };
        override['original_argument_length'] = cb.length;
        return override;
    };
    Actions.prototype.dispatch = function (actionName, data, additionalParams) {
        if (typeof this.actions[actionName] === 'undefined') {
            console.warn('Attempting to call non registered action: ' + actionName);
            return;
        }
        this._debug("ACTION.DISPATCH: " + actionName, data);
        var cb = this.actions[actionName].cb;
        var results = cb.apply(null, data);
        this.actions[actionName].stores.forEach(function (storeInfo) {
            var store = storeInfo.store;
            var cb = storeInfo.cb;
            store.stateChange(actionName, cb(results, additionalParams));
        });
    };
    Actions.prototype.register = function (actionData, store) {
        for (var actionName in actionData) {
            if (typeof this.actions[actionName] === 'undefined') {
                console.warn('Store attempting to register missing action: ' + actionName);
                continue;
            }
            this._debug(actionName + " registered for ", store);
            this.actions[actionName].stores.push({
                store: store,
                cb: actionData[actionName]
            });
        }
        this.actions[base_store_1.default.ACTION_SEED + "_" + store.uuid] = {
            cb: function (raw) {
                return raw;
            },
            stores: [{
                    cb: store.__onSeed,
                    store: store
                }]
        };
    };
    Actions.prototype._debug = function () {
        var any = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            any[_i] = arguments[_i];
        }
        if (!this.debug) {
            return;
        }
        console.debug.apply(null, arguments);
    };
    return Actions;
}());
exports.default = Actions;
