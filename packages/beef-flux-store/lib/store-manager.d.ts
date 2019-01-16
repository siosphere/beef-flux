/// <reference types="node" />
import Store, { StoreConfig } from './base-store';
/**
 * Store manager controls store flushes
 * Multiple store flushes are batched together
 *
 */
declare class StoreManager {
    stores: {
        [key: string]: Store<any>[];
    };
    meshValues: {
        [key: string]: StoreConfig;
    };
    flushQueue: {
        [key: string]: boolean;
    };
    constructor();
    queueFlush(store: Store<any>): number | void;
    register(store: Store<any>): void;
    protected flushStores(key: string): void;
    protected clearFlush(key: string): number | NodeJS.Timeout;
    protected getConfig(key: string): StoreConfig;
}
declare const Manager: StoreManager;
export default Manager;
//# sourceMappingURL=store-manager.d.ts.map