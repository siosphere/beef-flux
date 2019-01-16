"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Model = /** @class */ (function () {
    function Model(raw) {
        if (raw === void 0) { raw = null; }
        if (raw && typeof raw === 'object') {
            for (var key in raw) {
                this[key] = raw[key];
            }
        }
    }
    return Model;
}());
exports.default = Model;
