/// <reference types="react" />
import Actions, { ActionsManager } from './actions';
import Model from './model';
import Store, { useStore } from './base-store';
import { SubscribeMap } from './subscribe';
import { Manager as ContextManager } from './context';
import Schema from './decorators/schema-decorator';
declare const _default: {
    Actions: typeof Actions;
    Model: typeof Model;
    BaseStore: typeof Store;
    Context: import("react").Context<ContextManager>;
    subscribe: (storeMap: SubscribeMap) => any;
    Wrap: (Component: typeof import("react").Component) => (props: any) => JSX.Element;
};
export default _default;
export { ActionsManager, SubscribeMap, ContextManager, Schema, useStore };
