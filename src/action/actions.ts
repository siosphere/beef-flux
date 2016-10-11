import Store from "../store/store"

export class ActionsClass
{
    actions : any = {}
    constructor()
    {
        this.define = this.define.bind(this)
        this.dispatch = this.dispatch.bind(this)
        this.register = this.register.bind(this)
    }

    define(actionName, cb)
    {
        console.log('attempting to define action', actionName)
        if(typeof this.actions[actionName] !== 'undefined') {
            console.warn('Action with name ' + actionName + ' was already defined, and is now being overwritten')
        }

        this.actions[actionName] = {
            cb: cb,
            stores: []
        }
        let override = function() {
            this.dispatch(actionName, arguments)
        }
        override = override.bind(this)

        override.toString = () => {
            return actionName
        }

        return override
    }

    dispatch(actionName : string, data : any)
    {
        if(typeof this.actions[actionName] === 'undefined') {
            console.warn('Attempting to call non registered action: ' + actionName)
        }

        let cb = this.actions[actionName].cb
        let results = cb.apply(null, data)
        this.actions[actionName].stores.forEach((storeInfo) => {
            let store = storeInfo.store
            let cb = storeInfo.cb
            store.stateChange(actionName, cb(results))
        })
    }

    register<T>(actionData : any, store : Store<T>)
    {
        for(var actionName in actionData)
        {
            if(typeof this.actions[actionName] === 'undefined') {
                console.warn('Store attempting to register missing action: ' + actionName)
                continue
            }

            this.actions[actionName].stores.push({
                store: store,
                cb: actionData[actionName]
            })
        }
    }
}

const Actions = new ActionsClass()

export default Actions