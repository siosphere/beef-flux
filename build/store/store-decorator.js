"use strict";
var store_1 = require("./store");
/**
 * This is used to build a schema from a typescript class without having to
 * redefine all the fields.
 *
 * Usage:
 *
 * class MyAwesomeObject
 * {
 *     public static schema = {}
 *
 *     @Schema.int()
 *     myAwesomeField : number
 *
 *     @Schema.object({
 *         schema: () => {
 *             return SomeOtherObject.schema
 *         }
 *     })
 *     myAwesomeObject : any
 * }
 */
exports.Schema = {
    int: function (config) {
        if (config === void 0) { config = null; }
        return setupFunction.bind(null, store_1.default.int.bind(null, config));
    },
    string: function (config) {
        if (config === void 0) { config = null; }
        return setupFunction.bind(null, store_1.default.string.bind(null, config));
    },
    double: function (config) {
        if (config === void 0) { config = null; }
        return setupFunction.bind(null, store_1.default.double.bind(null, config));
    },
    bool: function (config) {
        if (config === void 0) { config = null; }
        return setupFunction.bind(null, store_1.default.bool.bind(null, config));
    },
    float: function (config) {
        if (config === void 0) { config = null; }
        return setupFunction.bind(null, store_1.default.float.bind(null, config));
    },
    array: function (config) {
        if (config === void 0) { config = null; }
        return setupFunction.bind(null, store_1.default.array.bind(null, config));
    },
    object: function (config) {
        if (config === void 0) { config = null; }
        return setupFunction.bind(null, store_1.default.object.bind(null, config));
    },
    datetime: function (config) {
        if (config === void 0) { config = null; }
        return setupFunction.bind(null, store_1.default.datetime.bind(null, config));
    },
    callback: function (config) {
        if (config === void 0) { config = null; }
        return setupFunction.bind(null, store_1.default.callback.bind(null, config));
    },
    custom: function (type, config) {
        if (config === void 0) { config = null; }
        return setupFunction.bind(null, store_1.default.customType.bind(null, type, config));
    },
    uuid: function (config) {
        if (config === void 0) { config = {}; }
        config.initial = function () {
            return uuid();
        };
        return setupFunction.bind(null, store_1.default.string.bind(null, config));
    }
};
var setupFunction = function (storeCallback, target, propertyKey, descriptor) {
    target.constructor.schema[propertyKey] = storeCallback();
};
var uuid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
