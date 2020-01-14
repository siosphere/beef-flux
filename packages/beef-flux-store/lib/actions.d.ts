import Store from "./base-store";
declare abstract class Actions {
    private actions;
    protected debug: boolean;
    constructor();
    setDebug(debug: any): this;
    define(actionName: string, cb: (...any: any[]) => any): (...any: any[]) => any;
    dispatch(actionName: string, data: any, additionalParams?: any): void;
    register<T>(actionData: {
        [P in keyof this]?: (...any: any[]) => any;
    }, store: Store<T>): void;
    private _debug;
}
export default Actions;
