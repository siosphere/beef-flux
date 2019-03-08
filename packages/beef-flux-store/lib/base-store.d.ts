import * as React from 'react';
import { Manager } from './context';
export interface StateHistory<T> {
    actionName: string;
    state: T;
}
export interface StoreConfig {
    async: boolean;
    flushRate: number;
    highPerformance: boolean;
    meshKey: string | null;
}
export interface StoreDump<T> {
    state: T;
}
/**
 * Store that hooks into actions
 *
 * Store holds all data and is the only class that should modify the data,
 * anything that pulls data from the DataStore cannot modify it and should treat
 * it as immutable
 */
declare abstract class Store<T> {
    static ACTION_SEED: string;
    uuid: string;
    config: StoreConfig;
    /**
     * Holds our state
     */
    protected state: T;
    /**
     *  If state history is enabled, all state changes are saved here
     */
    protected stateHistory: StateHistory<T>[];
    /**
     * Hold our listeners, whenever the store's state changes, they will be
     * notified, and sent the new state, and old state
     */
    protected listeners: ((...any: any[]) => any)[];
    /**
     * High performance loads will only dispatch state updates on requestAnimationFrame
     */
    protected highPerformance: boolean;
    /**
     * Used to signify if the state is dirty and we should send a notify
     */
    protected dirtyState: boolean;
    /**
     *
     */
    protected _nextState: T;
    /**
     * Whether or not we are in debug mode
     */
    debug: boolean;
    protected pendingActions: string[];
    protected __seedFunctions: any[];
    constructor();
    static subscribe<C, T>(onUpdate: (componentState: C, nextStoreState: T, oldStoreState: T) => Partial<C>): any;
    static subscribeTo<C, T, P extends {
        new (...args: any[]): {};
    }>(onUpdate: (componentState: C, nextStoreState: T, oldStoreState: T) => Partial<C>, constructor: P): {
        new (args: any): {
            [x: string]: any;
            __listeners: number[];
            componentDidMount(): void;
            componentWillUnmount(): void;
        };
        [x: string]: any;
        contextType: React.Context<Manager>;
    };
    static Config(config: Partial<StoreConfig>): <P extends new (...args: any[]) => {}>(constructor: P) => {
        new (...args: any[]): {
            config: any;
        };
    } & P;
    static OnSeed<T>(cb: (p: Partial<T>) => any): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
    isDirty(): boolean;
    seed(partialState: any): void;
    dump(): string;
    clear(): void;
    /**
     * Listen on a given event
     */
    listen(callback: ((...args: any[]) => any)): number;
    /**
     * Return our current state
     */
    getState(): T;
    /**
     * Ignore an event we are listening on
     */
    ignore(callback: ((...args: any[]) => any) | number): boolean;
    /**
     * Change the state
     */
    stateChange(actionName: string, nextState: T): void;
    /**
     * Flush state change to store and inform listeners
     */
    flush(): void;
    /**
     * Clonse the current state
     */
    cloneState(): T;
    /**
     * @deprecated use nextState
     */
    newState(): T;
    /**
     * Return the next state (this is a WIP state that has not been sent to listeners)
     */
    nextState(): T;
    /**
     * Sends notification of state to given listeners
     */
    protected notify(oldState: T): void;
    /**
     * Insert an item into the given modelArray, update it if it already exists
     */
    upsertItem(modelArray: any[], keyValue: any, newItem: any, overwrite?: boolean): boolean;
    /**
     * Get an item from a modelArray
     */
    getItem(modelArray: any[], keyValue: any): any;
    /**
     * Remove an item from a modelArray
     */
    removeItem(modelArray: any[], keyValue: any): any[] | boolean;
    /**
     * Pass in an array of keyValues and remove all items that match
     */
    removeItems(modelArray: any[], keyValues: any[]): void;
    /**
     * Sanitize and valide the given object to the given schema
     */
    sanitizeAndValidate(obj: any, schema: any): any;
    /**
     * Validate the given object to the given schema, will return an array
     * of errors, or true if valid
     */
    validate(obj: any, schema: any): any[] | boolean;
    /**
     * Sanitize the given object to a schema, also an optional parameter if
     * you are sending the object as JSON, to format datetimes properly
     */
    sanitize(obj: any, schema: any, json?: boolean): any;
    /**
     * Merge objects together
     */
    merge(obj1: any, obj2: any): any;
    /**
     * Creates a filter sort callback to sort by a given key
     */
    sortBy(key: string, dir?: string): (a: any, b: any) => 1 | 0 | -1;
    /**
     * Formats a given number to two decimal places
     */
    money(value: number): string;
    static string(params?: {}): any;
    static int(params?: {}): any;
    static double(params?: {}): any;
    static bool(params?: {}): any;
    static float(params?: {}): any;
    static array(params?: {}): any;
    static object(params?: {}): any;
    static datetime(params?: {}): any;
    static callback(params?: {}): any;
    static customType(type: any, params?: {}): any;
    /**
     * Sanitizes a field on an object to the given schema
     */
    protected sanitizeField(field: string, schema: any, json: boolean, obj: any): any;
    protected sanitizeCallback(value: any, schemaConfig: any): any;
    /**
     * Sanitizes a field to an integer
     */
    protected sanitizeInteger(value: any, schemaConfig: any): any;
    /**
     * Sanitizes a field to a float
     */
    protected sanitizeFloat(value: any, schemaConfig: any): any;
    /**
     * Sanitizes a field to a string
     */
    protected sanitizeString(value: any, schemaConfig: any): any;
    /**
     * Sanitizes a field to a moment object
     */
    protected sanitizeDateTime(value: any, schemaConfig: any, json: boolean): any;
    /**
     * Sanitizes a field to boolean
     */
    protected sanitizeBoolean(value: any, schemaConfig: any): any;
    /**
     * Sanitizes an object
     */
    protected sanitizeObject(value: any, schemaConfig: any, json: boolean): any;
    /**
     * Sanitizes an array of objects
     */
    protected sanitizeArray(value: any, schemaConfig: any, json: boolean): any;
    __onSeed(rawState: Partial<T>): T;
}
export default Store;
