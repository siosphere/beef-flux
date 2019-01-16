"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var extend = require("extend");
var util_1 = require("./util");
var DEFAULT_MESH_CONFIG = {
    async: true,
    flushRate: 200,
    highPerformance: false,
    meshKey: null
};
/**
 * Store manager controls store flushes
 * Multiple store flushes are batched together
 *
 */
var StoreManager = /** @class */ (function () {
    function StoreManager() {
        this.stores = {};
        this.meshValues = {};
        this.flushQueue = {};
        this.register = this.register.bind(this);
        this.clearFlush = this.clearFlush.bind(this);
        this.queueFlush = this.queueFlush.bind(this);
        this.getConfig = this.getConfig.bind(this);
        this.flushStores = this.flushStores.bind(this);
    }
    StoreManager.prototype.queueFlush = function (store) {
        //
        var config = store.config;
        var key = store.uuid;
        if (config.meshKey) {
            config = this.getConfig(config.meshKey);
            key = config.meshKey;
        }
        if (!config.highPerformance && config.flushRate <= 0) {
            return this.flushStores(key);
        }
        if (this.flushQueue[key]) {
            return; //flush is already queued
        }
        if (typeof this.flushQueue[key] !== 'undefined' && !this.flushQueue[key]) {
            this.flushQueue[key] = true;
            return;
        }
        this.flushQueue[key] = false;
        this.flushStores(key);
        if (config.highPerformance) {
            return requestAnimationFrame(this.clearFlush.bind(null, key));
        }
        setTimeout(this.clearFlush.bind(null, key), config.flushRate);
    };
    StoreManager.prototype.register = function (store) {
        store.uuid = util_1.uuid();
        if (store.config.meshKey) {
            var meshKey = store.config.meshKey;
            var mesh = this.stores[meshKey];
            if (!mesh) {
                mesh = [];
            }
            mesh.push(store);
            this.stores[meshKey] = mesh;
            if (!this.meshValues[meshKey]) {
                this.meshValues[meshKey] = extend(true, {}, DEFAULT_MESH_CONFIG, store.config);
            }
            return;
        }
        this.stores[store.uuid] = [store];
    };
    StoreManager.prototype.flushStores = function (key) {
        this.stores[key].forEach(function (store) { return store.flush(); });
    };
    StoreManager.prototype.clearFlush = function (key) {
        if (this.flushQueue[key]) {
            this.flushStores(key);
            this.flushQueue[key] = false;
            var config = this.getConfig(key);
            if (config.highPerformance) {
                return requestAnimationFrame(this.clearFlush.bind(null, key));
            }
            return setTimeout(this.clearFlush.bind(null, key), config.flushRate);
        }
        delete this.flushQueue[key];
    };
    StoreManager.prototype.getConfig = function (key) {
        if (typeof this.meshValues[key] !== 'undefined') {
            return this.meshValues[key];
        }
        return this.stores[key][0].config;
    };
    return StoreManager;
}());
var Manager = new StoreManager;
exports.default = Manager;
