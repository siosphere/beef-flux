/// <reference path="../../../dist/typings/index.d.ts" />
"use strict";
var beef = require('beef');
var RECEIVE_TODOS = beef.Actions.define('RECEIVE_TODOS', function (rawTodos) {
    return rawTodos;
});
exports.RECEIVE_TODOS = RECEIVE_TODOS;
console.log('INCLUDED TODO ACTIONS');
