declare namespace Beef
{
    declare const Action: (actionName: string, cb: any) => () => void;
    declare class ActionsClass {
        actions: any;
        constructor();
        define(actionName: any, cb: any): () => void;
        dispatch(actionName: string, data: any, additionalParams?: any): void;
        register<T>(actionData: any, store: Store<T>): void;
    }
    declare const Actions: ActionsClass;

    declare class ApiServiceClass {
        throttle(func: () => any, wait: number, immediate: boolean): () => void;
        get(url: string, data: any, config?: ReqwestOptions): reqwest.ReqwestPromise<any>;
        post(url: string, data: any, config?: ReqwestOptions): reqwest.ReqwestPromise<any>;
        put(url: string, data: any, config?: ReqwestOptions): reqwest.ReqwestPromise<any>;
        ['delete'](url: string, data: any, config?: ReqwestOptions): reqwest.ReqwestPromise<any>;
        protected _buildUrl(url: string, data: any, queryString?: boolean): string;
        protected _buildConfig(defaultConfig: any, customConfig?: any): any;
    }

    declare let ApiService: ApiServiceClass;

    class RoutingConfig {
        routes: any;
        constructor(routes: any);
        isRoute(url: string): boolean;
        callRoute(url: string, data: any): any;
        handleRequest(url: string, request: any, response: any, data: any): any;
    }

    declare var sanitize: (value: any) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;

    declare class RoutingServiceClass {
        protected routingConfig: RoutingConfig;
        protected activeRoute: string;
        protected routeData: any;
        onRouteFinished(): void;
        routes(routes: any): this;
        route(url: string, data: any): any;
        handleRequest(url: string, request: any, response: any, data: any): any;
        doRouting(url?: string, request?: any, response?: any): any;
    }
    declare let RoutingService: RoutingServiceClass;

    declare let Schema: {
        int: (config?: any) => any;
        string: (config?: any) => any;
        double: (config?: any) => any;
        bool: (config?: any) => any;
        float: (config?: any) => any;
        array: (config?: any) => any;
        object: (config?: any) => any;
        datetime: (config?: any) => any;
        callback: (config?: any) => any;
        custom: (type: any, config?: any) => any;
        uuid: (config?: any) => any;
    };

    interface StateHistory<T> {
        actionName: string;
        state: T;
    }
    /**
     * Store that hooks into actions
     *
     * Store holds all data and is the only class that should modify the data,
     * anything that pulls data from the DataStore cannot modify it and should treat
     * it as immutable
     */
    declare class Store<T> {
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
        protected listeners: ((...any) => any)[];
        /**
         * Whether or not we are in debug mode
         */
        debug: boolean;
        constructor();
        /**
         * Listen on a given event
         */
        listen(callback: ((...args: any[]) => any)): void;
        getState(): T;
        /**
         * Ignore an event we are listening on
         */
        ignore(callback: ((...args: any[]) => any)): boolean;
        stateChange(actionName: string, newState: T): T;
        newState(): T;
        protected notify(oldState: T): void;
        /**
         * Insert an item into the given modelArray, update it if it already exists
         */
        upsertItem(modelArray: any[], keyValue: any, newItem: any, overwrite?: boolean): boolean;
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
        static customType(type: any, params?: {}): {
            type: any;
            schema: any;
        };
        /**
         * Sanitizes a field on an object to the given schema
         */
        protected sanitizeField(field: string, obj: any, schema: any, json: boolean): any;
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
    }

    declare var _default: {
        Actions: ActionsClass;
        ApiService: ApiServiceClass;
        ApiServiceClass: typeof ApiServiceClass;
        RoutingConfig: typeof RoutingConfig;
        sanitize: (value: any) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
        RoutingService: RoutingServiceClass;
        RoutingServiceClass: typeof RoutingServiceClass;
        Store: typeof Store;
        Schema: {
            int: (config?: any) => any;
            string: (config?: any) => any;
            double: (config?: any) => any;
            bool: (config?: any) => any;
            float: (config?: any) => any;
            array: (config?: any) => any;
            object: (config?: any) => any;
            datetime: (config?: any) => any;
            callback: (config?: any) => any;
            custom: (type: any, config?: any) => any;
            uuid: (config?: any) => any;
        };
    };
}