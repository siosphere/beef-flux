import Store from '../store/store'

const Action = (actionName : string, cb) => {

    const storeCallbacks = []

    let actionFunction = function() {
        let results = cb.apply(this, arguments)
        
        storeCallbacks.forEach((storeInfo) => {
            let store = storeInfo.store
            let cb = store[storeInfo.cb]
            if(store.debug) {
                console.log('dispatching action', {
                    action: actionName,
                    newState: results
                })
            }
            store.stateChange(actionName, cb(results))
        })
    }

    actionFunction['ACTION_NAME'] = actionName

    actionFunction['bind'] = (store, cb) => {
        storeCallbacks.push({
            store: store,
            cb: cb
        })
    }

    return actionFunction
}


export default Action