"use strict";
var action_1 = require("./component/action");
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
        var action = new action_1.Action();
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
exports.Actions = Actions;
;
