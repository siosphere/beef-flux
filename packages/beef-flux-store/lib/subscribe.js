"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var subscribe = function (storeMap) {
    for (var storeName in storeMap) {
        var cb = storeMap[storeName];
        return subscribeTo.bind(_this, storeName, cb);
    }
};
function subscribeTo(storeName, cb, constructor) {
    return /** @class */ (function (_super) {
        __extends(class_1, _super);
        function class_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.__listeners = [];
            return _this;
        }
        class_1.prototype.componentDidMount = function () {
            var _this = this;
            _super.prototype['componentDidMount'] ? _super.prototype['componentDidMount'].call(this) : null;
            this.__listeners.push(this['props'][storeName].listen(function (nextState, oldState) { return _this['setState'](cb(_this['state'], nextState, oldState)); }));
        };
        class_1.prototype.componentWillUnmount = function () {
            var _this = this;
            _super.prototype['componentWillUnmount'] ? _super.prototype['componentWillUnmount'].call(this) : null;
            this.__listeners.forEach(function (index) {
                _this['props'][storeName].ignore(index);
            });
        };
        return class_1;
    }(constructor));
}
exports.default = subscribe;
