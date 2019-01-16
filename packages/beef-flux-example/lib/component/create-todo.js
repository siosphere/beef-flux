"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
// # Actions
var todo_actions_1 = require("../actions/todo-actions");
var CreateTodo = /** @class */ (function (_super) {
    __extends(CreateTodo, _super);
    function CreateTodo(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            title: ''
        };
        _this.createTodo = _this.createTodo.bind(_this);
        _this.isValid = _this.isValid.bind(_this);
        return _this;
    }
    CreateTodo.prototype.render = function () {
        var _this = this;
        return React.createElement("form", { className: "create-todo-form", onSubmit: this.createTodo },
            React.createElement("input", { type: "text", value: this.state.title, onChange: function (e) { _this.setState({ title: e.target.value }); } }),
            React.createElement("button", { type: "submit", disabled: !this.isValid() }, "Create Todo"));
    };
    CreateTodo.prototype.createTodo = function (e) {
        e.preventDefault();
        todo_actions_1.default.RECEIVE_TODOS([{
                title: this.state.title
            }]);
        this.setState({
            title: ''
        });
    };
    CreateTodo.prototype.isValid = function () {
        return this.state.title && this.state.title.length > 0;
    };
    return CreateTodo;
}(React.PureComponent));
exports.default = CreateTodo;
