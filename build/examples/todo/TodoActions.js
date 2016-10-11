/// <reference path="../../../dist/typings/index.d.ts" />
"use strict";
var beef = require('beef');
exports.RECEIVE_TODOS = beef.Action('RECEIVE_TODOS', function (rawTodos) {
    return rawTodos;
});
