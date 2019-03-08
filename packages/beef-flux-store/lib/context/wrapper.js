"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var context_1 = require("../context");
var Wrapper = function (Component) {
    return function (props) {
        return React.createElement(context_1.default.Consumer, null, function (manager) { return React.createElement(Component, __assign({}, props, { _manager: manager })); });
    };
};
exports.default = Wrapper;
