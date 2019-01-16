"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
/**
 * Move manager to a separate class
 * For seeding use manager to get the store (no prefix) which will create if needed and then seed.
 */
var Manager = /** @class */ (function () {
    function Manager() {
        this.stores = {};
        this.initialStates = {};
        this.getStore = this.getStore.bind(this);
        this.dump = this.dump.bind(this);
        this.seed = this.seed.bind(this);
    }
    Manager.prototype.getStore = function (storeName, storeType) {
        if (typeof this.stores[storeName] !== 'undefined') {
            return this.stores[storeName];
        }
        if (!storeType) {
            return null;
        }
        var store = this.stores[storeName] = new storeType();
        if (typeof this.initialStates[storeName] !== 'undefined') {
            var storeStates = this.initialStates[storeName];
            delete this.initialStates[storeName];
            storeStates.forEach(function (storeState) { return store.seed(storeState); });
        }
        return store;
    };
    Manager.prototype.dump = function () {
        var state = {};
        for (var storeName in this.stores) {
            var store = this.stores[storeName];
            state[storeName] = store.dump();
        }
        return state;
    };
    Manager.prototype.seed = function (state) {
        for (var storeName in state) {
            var storeState = state[storeName];
            var store = this.getStore(storeName, null);
            if (store) {
                store.seed(storeState);
            }
            else {
                if (typeof this.initialStates[storeName] === 'undefined') {
                    this.initialStates[storeName] = [];
                }
                this.initialStates[storeName].push(storeState);
            }
        }
    };
    return Manager;
}());
exports.Manager = Manager;
var StoreContext = React.createContext(new Manager);
exports.default = StoreContext;
