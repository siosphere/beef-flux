import Store from "./base-store"
import ActionsManager from './actions/manager'

abstract class Actions
{
    constructor()
    {

        Object.getOwnPropertyNames(Object.getPrototypeOf(this)).forEach((property) => {
            if(property === 'constructor' || property.indexOf('__') === 0) {
                return
            }
            
            if(typeof this[property] !== 'function') {
                return
            }

            this[property] = ActionsManager.define(property, this[property])
        })
    }

    public __register<T>(actionData : { [P in keyof this]?: (...any) => any }, store : Store<T>)
    {
        return ActionsManager.register(actionData, store)
    }
}

export default Actions

export {
    ActionsManager
}