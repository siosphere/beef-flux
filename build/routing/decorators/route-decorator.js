"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sanitizeField = function (value, sanitizeConfig) {
    switch (sanitizeConfig.type) {
        case 'int':
        case 'integer':
            return parseInt(value);
        case 'float':
            return parseFloat(value);
        case 'string':
            return "" + value;
        case "bool":
        case "boolean":
            return typeof value !== 'undefined' &&
                (value === true || (typeof value === 'string' && value.toLowerCase() === 'yes') || value === 1 || value === "1") ? true : false;
    }
};
var sanitize = function (value) {
    return function (target, propertyKey, descriptor) {
        var routeMethod = target[propertyKey];
        descriptor.value = function (data) {
            var sanitized = data;
            for (var key in sanitized) {
                if (typeof value[key] !== 'undefined') {
                    sanitized[key] = sanitizeField(sanitized[key], value[key]);
                }
            }
            return routeMethod.apply(target, [sanitized]);
        };
    };
};
exports.sanitize = sanitize;
