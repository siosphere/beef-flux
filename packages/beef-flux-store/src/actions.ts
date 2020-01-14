import Store from "./base-store"

abstract class Actions
{
    private actions : any = {}
    
    protected debug : boolean

    constructor()
    {
        this.define = this.define.bind(this)
        this.dispatch = this.dispatch.bind(this)
        this.register = this.register.bind(this)
        this.debug = false

        Object.getOwnPropertyNames(Object.getPrototypeOf(this)).forEach((property) => {
            if(property === 'constructor' || property.indexOf('__') === 0) {
                return
            }
            
            if(typeof this[property] !== 'function') {
                return
            }

            this[property] = this.define(property, this[property])
        })
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
            return
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

    register<T>(actionData : { [P in keyof this]?: (...any) => any }, store : Store<T>)
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

export default Actions