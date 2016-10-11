"use strict";
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
            var actionName = params[key].name;
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
exports.Action = Action;
