import * as React from 'react';
/**
 * Move manager to a separate class
 * For seeding use manager to get the store (no prefix) which will create if needed and then seed.
 */
export declare class Manager {
    stores: any;
    initialStates: any;
    constructor();
    getStore(storeName: any, storeType: any): any;
    dump(): {};
    seed(state: any): void;
}
declare const StoreContext: React.Context<Manager>;
export default StoreContext;
