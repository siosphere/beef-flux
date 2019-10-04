"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var store_1 = require("@beef-flux/store");
var app = express();
var port = 3000;
var handle = store_1.default.Scope(function (scope) { return function (req, res) {
    console.log(scope);
}; });
app.get('/', handle);
app.listen(port, function () { return console.log("Example app listening on port " + port + "!"); });
