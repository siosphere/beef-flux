export class ActionsClass {
    constructor() {
        this.actions = {};
        this.define = this.define.bind(this);
        this.dispatch = this.dispatch.bind(this);
        this.register = this.register.bind(this);
    }
    define(actionName, cb) {
        if (typeof this.actions[actionName] !== 'undefined') {
            console.warn('Action with name ' + actionName + ' was already defined, and is now being overwritten');
        }
        this.actions[actionName] = {
            cb: cb,
            stores: []
        };
        let override = function () {
            this.dispatch(actionName, arguments);
        };
        override = override.bind(this);
        override.toString = () => {
            return actionName;
        };
        override['original_argument_length'] = cb.length;
        return override;
    }
    dispatch(actionName, data, additionalParams) {
        if (typeof this.actions[actionName] === 'undefined') {
            console.warn('Attempting to call non registered action: ' + actionName);
        }
        let cb = this.actions[actionName].cb;
        let results = cb.apply(null, data);
        this.actions[actionName].stores.forEach((storeInfo) => {
            let store = storeInfo.store;
            let cb = storeInfo.cb;
            store.stateChange(actionName, cb(results, additionalParams));
        });
    }
    register(actionData, store) {
        for (var actionName in actionData) {
            if (typeof this.actions[actionName] === 'undefined') {
                console.warn('Store attempting to register missing action: ' + actionName);
                continue;
            }
            this.actions[actionName].stores.push({
                store: store,
                cb: actionData[actionName]
            });
        }
    }
}
const Actions = new ActionsClass();
export default Actions;
