"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var manager_1 = require("./actions/manager");
exports.ActionsManager = manager_1.default;
var Actions = /** @class */ (function () {
    function Actions() {
        var _this = this;
        Object.getOwnPropertyNames(Object.getPrototypeOf(this)).forEach(function (property) {
            if (property === 'constructor' || property.indexOf('__') === 0) {
                return;
            }
            if (typeof _this[property] !== 'function') {
                return;
            }
            _this[property] = manager_1.default.define(property, _this[property]);
        });
    }
    Actions.prototype.__register = function (actionData, store) {
        return manager_1.default.register(actionData, store);
    };
    return Actions;
}());
exports.default = Actions;
