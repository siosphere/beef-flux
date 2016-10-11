"use strict";
var Action = function (actionName, cb) {
    var storeCallbacks = [];
    var actionFunction = function () {
        var results = cb.apply(this, arguments);
        storeCallbacks.forEach(function (storeInfo) {
            var store = storeInfo.store;
            var cb = store[storeInfo.cb];
            store.stateChange(actionName, cb(results));
        });
    };
    actionFunction['ACTION_NAME'] = actionName;
    actionFunction['bind'] = function (store, cb) {
        storeCallbacks.push({
            store: store,
            cb: cb
        });
    };
    return actionFunction;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Action;
