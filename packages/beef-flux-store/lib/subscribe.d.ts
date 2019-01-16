export interface SubscribeMap {
    [s: string]: (componentState: any, nextState: any, oldState: any) => any;
}
declare const subscribe: (storeMap: SubscribeMap) => any;
export default subscribe;
