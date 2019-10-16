"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Model = /** @class */ (function () {
    function Model() {
    }
    Model.prototype.create = function (raw) {
        if (raw === void 0) { raw = null; }
        if (raw && typeof raw === 'object') {
            Object.assign(this, raw);
        }
    };
    return Model;
}());
exports.default = Model;
