/// <reference types="react" />
import Actions, { ActionsManager } from './actions';
import Model from './model';
import Store from './base-store';
import { SubscribeMap } from './subscribe';
import { Manager as ContextManager } from './context';
declare const _default: {
    Actions: typeof Actions;
    Model: typeof Model;
    BaseStore: typeof Store;
    decorators: {
        Schema: typeof import("./decorators/schema-decorator").default;
    };
    Context: import("react").Context<ContextManager>;
    subscribe: (storeMap: SubscribeMap) => any;
};
export default _default;
export { ActionsManager, SubscribeMap, ContextManager };
