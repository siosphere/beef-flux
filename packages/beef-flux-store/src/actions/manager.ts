import Store from "../base-store"

class ActionsManager
{
    actions : any = {}
    debug : boolean
    constructor()
    {
        this.define = this.define.bind(this)
        this.dispatch = this.dispatch.bind(this)
        this.register = this.register.bind(this)
        this.debug = false
    }

    setDebug(debug)
    {
        this.debug = debug

        return this
    }

    define(actionName : string, cb : (...any) => any) : (...any) => any
    {
        if(typeof actionName !== 'string') {
            console.error("actionName is not a valid string", actionName)
        }

        if(typeof cb !== 'function') {
            console.error("Must pass valid callback for action: ", cb)
        }

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

        override['original_argument_length'] = cb.length

        return override
    }

    dispatch(actionName : string, data : any, additionalParams ?: any)
    {
        if(typeof this.actions[actionName] === 'undefined') {
            console.warn('Attempting to call non registered action: ' + actionName)
        }
        
        this._debug(`ACTION.DISPATCH: ${actionName}`, data)

        let cb = this.actions[actionName].cb
        let results = cb.apply(null, data)
        this.actions[actionName].stores.forEach((storeInfo) => {
            let store = storeInfo.store
            let cb = storeInfo.cb
            store.stateChange(actionName, cb(results, additionalParams))
        })
    }

    register<T>(actionData : object, store : Store<T>)
    {
        for(var actionName in actionData)
        {
            if(typeof this.actions[actionName] === 'undefined') {
                console.warn('Store attempting to register missing action: ' + actionName)
                continue
            }
            this._debug(`${actionName} registered for `, store)
            this.actions[actionName].stores.push({
                store: store,
                cb: actionData[actionName]
            })
        }

        this.actions[`${Store.ACTION_SEED}_${store.uuid}`] = {
            cb: (raw) => {
                return raw
            },
            stores: [{
                cb: store.__onSeed,
                store: store
            }]
        }
    }

    private _debug(...any)
    {
        if(!this.debug) {
            return
        }

        console.debug.apply(null, arguments)
    }
}

const Manager = new ActionsManager()

export default Manager