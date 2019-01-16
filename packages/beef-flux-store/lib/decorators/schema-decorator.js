"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var base_store_1 = require("../base-store");
var util_1 = require("../util");
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
var Schema = /** @class */ (function () {
    function Schema() {
    }
    Schema.int = function (config) {
        if (config === void 0) { config = null; }
        return setupFunction.bind(null, base_store_1.default.int.bind(null, config));
    };
    Schema.string = function (config) {
        if (config === void 0) { config = null; }
        return setupFunction.bind(null, base_store_1.default.string.bind(null, config));
    };
    Schema.bool = function (config) {
        if (config === void 0) { config = null; }
        return setupFunction.bind(null, base_store_1.default.bool.bind(null, config));
    };
    Schema.float = function (config) {
        if (config === void 0) { config = null; }
        return setupFunction.bind(null, base_store_1.default.float.bind(null, config));
    };
    Schema.double = function (config) {
        if (config === void 0) { config = null; }
        return Schema.float(config);
    };
    Schema.array = function (config) {
        if (config === void 0) { config = null; }
        return setupFunction.bind(null, base_store_1.default.array.bind(null, config));
    };
    Schema.object = function (config) {
        if (config === void 0) { config = null; }
        return setupFunction.bind(null, base_store_1.default.object.bind(null, config));
    };
    Schema.datetime = function (config) {
        if (config === void 0) { config = null; }
        return setupFunction.bind(null, base_store_1.default.datetime.bind(null, config));
    };
    Schema.callback = function (config) {
        if (config === void 0) { config = null; }
        return setupFunction.bind(null, base_store_1.default.callback.bind(null, config));
    };
    Schema.custom = function (config) {
        if (config === void 0) { config = null; }
        return setupFunction.bind(null, base_store_1.default.customType.bind(null, config));
    };
    Schema.uuid = function (config) {
        if (config === void 0) { config = { initial: null }; }
        config.initial = function () {
            return util_1.uuid();
        };
        return setupFunction.bind(null, base_store_1.default.string.bind(null, config));
    };
    return Schema;
}());
var setupFunction = function (storeCallback, target, propertyKey, descriptor) {
    target.constructor.schema[propertyKey] = storeCallback();
};
exports.default = Schema;
