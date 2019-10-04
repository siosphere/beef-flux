"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var Manager = /** @class */ (function () {
    function Manager(prefix) {
        if (prefix === void 0) { prefix = ''; }
        this.prefix = prefix;
    }
    Manager.prototype.getStore = function (name) {
        console.log('getting store with name: ' + this.prefix + ':' + name);
    };
    return Manager;
}());
exports.Manager = Manager;
var StoreContext = React.createContext(new Manager);
exports.default = StoreContext;
