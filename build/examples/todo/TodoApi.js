/// <reference path="../../../dist/typings/index.d.ts" />
"use strict";
var beef = require('beef');
var Api = beef.ApiService;
var URL_TODO = "#/mock/api";
var TodoApi = (function () {
    function TodoApi() {
    }
    TodoApi.saveTodo = function (todo) {
        console.log('attempting to save TODO!');
        Api.post(URL_TODO, todo).then(function () {
            console.log('our then state, who knew?');
        }).fail(function () {
            console.log('should fail, since mock api');
        });
    };
    return TodoApi;
}());
exports.TodoApi = TodoApi;
