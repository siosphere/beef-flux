"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var Todo = function (props) {
    return React.createElement("li", { onClick: props.toggle, className: "" + (props.done ? 'done' : '') },
        React.createElement("strong", null, props.title),
        React.createElement("em", null, props.id));
};
exports.default = Todo;
