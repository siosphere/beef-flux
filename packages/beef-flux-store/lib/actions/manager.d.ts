import Store from "../base-store";
declare class ActionsManager {
    actions: any;
    debug: boolean;
    constructor();
    setDebug(debug: any): this;
    define(actionName: string, cb: (...any: any[]) => any): (...any: any[]) => any;
    dispatch(actionName: string, data: any, additionalParams?: any): void;
    register<T>(actionData: object, store: Store<T>): void;
    private _debug;
}
declare const Manager: ActionsManager;
export default Manager;
