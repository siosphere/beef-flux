import Store from "./base-store";
import ActionsManager from './actions/manager';
declare abstract class Actions {
    constructor();
    __register<T>(actionData: {
        [P in keyof this]?: (...any: any[]) => any;
    }, store: Store<T>): void;
}
export default Actions;
export { ActionsManager };
