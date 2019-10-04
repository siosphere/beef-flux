import * as React from 'react';
export declare class Manager {
    prefix: any;
    constructor(prefix?: string);
    getStore(name: any): void;
}
declare const StoreContext: React.Context<Manager>;
export default StoreContext;
