declare module 'beef'
{
    import * as reqwest from "reqwest";
    import { ReqwestOptions } from "reqwest";
    /**
     * Wrapper to create a consistent sdk for doing XHR requests. Will
     * automatically replace matching variables in urls that match the pattern.
     * i.e/ /my/url/{someId}/ { someId: 1 } = /my/url/1/
     */
    export class ApiServiceClass {
        throttle(func: () => any, wait: number, immediate: boolean): () => void;
        get(url: string, data: any, config?: ReqwestOptions): reqwest.ReqwestPromise<any>;
        post(url: string, data: any, config?: ReqwestOptions): reqwest.ReqwestPromise<any>;
        put(url: string, data: any, config?: ReqwestOptions): reqwest.ReqwestPromise<any>;
        ['delete'](url: string, data: any, config?: ReqwestOptions): reqwest.ReqwestPromise<any>;
        protected _buildUrl(url: string, data: any, queryString?: boolean): string;
        protected _buildConfig(defaultConfig: any, customConfig?: any): any;
    }
    export let ApiService: ApiServiceClass;
    export class Actions {
        static ignoreFunctions: string[];
        /**
         * Create the action
         */
        static create(params: any): any;
    }

    export class Action {
        protected _callbacks: any;
        /**
         * Register functions to actions we may contain,
         * Params should be an object where the "key" is the function that should
         * be called on "scope" when the params[key] action takes place
         */
        _register(params: any, scope: any): void;
        /**
         * Internal function used to dispatch a message when an action is called
         */
        _dispatch(actionName: string, fn: (...args) => any, args: any): void;
    }

    class Store {
        /**
         * Holds all of our rows by modelType
         */
        protected rows: any;
        /**
         *  Cache objects by primary key to speed up upsert lookup time
         */
        protected cache: any;
        /**
         * This store's action callbacks
         */
        actions: () => void;
        /**
         * Used to create a store without extending the class
         */
        static create(params: any): Store;
        /**
         * Listen on a given event
         */
        listen(event: string, callback: ((...args: any[]) => any)): void;
        /**
         * Ignore an event we are listening on
         */
        ignore(event: string, callback: ((...args: any[]) => any)): void;
        /**
         * Emit an event
         */
        emit(event: string, data?: any): void;
        /**
         * Insert a row if it doesn't exist, update it otherwise
         */
        upsertRow(modelType: string, keyValue: any, newRow: any, overwrite?: boolean): void;
        /**
         * Check if we have a model setup in cache
         */
        protected inCache(modelType: any, keyValue: any): boolean;
        /**
         * Remove a row
         */
        removeRow(modelType: string, keyValue: any): void;
        /**
         * Pass in an array of keyValues and remove all rows that match
         */
        removeRows(modelType: string, keyValues: any[]): void;
        /**
         * Clear our store of the given modelType
         */
        clearAll(modelType: string): void;
        /**
         * Get rows of the given modelType
         */
        getRows(modelType: string, noSlice?: boolean): any[];
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
         * Merge objects together to a given depth
         */
        merge(obj1: any, obj2: any, depth?: number): any;
        /**
         * Creates a filter sort callback to sort by a given key
         */
        sortBy(key: string, dir?: string): (a: any, b: any) => number;
        /**
         * Formats a given number to two decimal places
         */
        money(value: number): string;
        /**
         * Generates a UUID
         */
        uuid(): string;
        static string(params?: {}): {
            type: string;
        };
        static int(params?: {}): {
            type: string;
        };
        static double(params?: {}): {
            type: string;
        };
        static bool(params?: {}): {
            type: string;
        };
        static float(params?: {}): {
            type: string;
        };
        static array(params?: {}): {
            type: string;
            schema: any;
        };
        static object(params?: {}): {
            type: string;
            schema: any;
        };
        static datetime(params?: {}): {
            type: string;
            schema: any;
            format: string;
        };
        static callback(params?: {}): {
            type: string;
            schema: any;
        };
        /**
         * Sanitizes a field on an object to the given schema
         */
        protected sanitizeField(field: string, obj: any, schema: any, json: boolean): any;
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
    }

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
    export let Schema: {
        int: (config?: any) => any;
        string: (config?: any) => any;
        double: (config?: any) => any;
        bool: (config?: any) => any;
        float: (config?: any) => any;
        array: (config?: any) => any;
        object: (config?: any) => any;
        datetime: (config?: any) => any;
        callback: (config?: any) => any;
        uuid: (config?: any) => any;
    };

    /**
     * Will match a given url to a route, and execute a function/callback defined
     * for that route. Will also parse the URL for different parameters and
     * pass that into the callback if found
     */
    export class RoutingServiceClass {
        protected routingConfig: RoutingConfig;
        protected activeRoute: string;
        protected routeData: any;
        onRouteFinished(): void;
        routes(routes: any): this;
        route(url: string, data: any): any;
        handleRequest(url: string, request: any, data: any): any;
        doRouting(): void;
    }
    export let RoutingService: RoutingServiceClass;

    /**
     * Holds routes (an object with 'url/pattern': function())
     */
    export class RoutingConfig {
        routes: any;
        constructor(routes: any);
        isRoute(url: string): boolean;
        callRoute(url: string, data: any): any;
        handleRequest(url: string, request: any, data: any): any;
    }
}