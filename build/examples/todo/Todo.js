/// <reference path="../../../dist/typings/index.d.ts" />
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var beef = require('beef');
var Todo = (function () {
    function Todo(properties) {
        if (properties === void 0) { properties = {}; }
        for (var key in properties) {
            this[key] = properties[key];
        }
    }
    Todo.schema = {};
    __decorate([
        beef.Schema.uuid()
    ], Todo.prototype, "id", void 0);
    __decorate([
        beef.Schema.string({
            initial: function () { return ''; }
        })
    ], Todo.prototype, "name", void 0);
    return Todo;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Todo;
