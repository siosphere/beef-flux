import extend = require('extend')
import Store, {StoreConfig} from './base-store'
import {uuid} from './util'


const DEFAULT_MESH_CONFIG : StoreConfig = {
    async: true,
    flushRate: 200,
    highPerformance: false,
    meshKey: null
}

/**
 * Store manager controls store flushes
 * Multiple store flushes are batched together
 * 
 */
class StoreManager
{
    stores : { [key : string] : Store<any>[]} = {}

    meshValues : {[key:string] : StoreConfig} = {}

    flushQueue : {[key:string] : boolean} = {}

    constructor()
    {
        this.register = this.register.bind(this)
        this.clearFlush = this.clearFlush.bind(this)
        this.queueFlush = this.queueFlush.bind(this)
        this.getConfig = this.getConfig.bind(this)
        this.flushStores = this.flushStores.bind(this)
    }

    queueFlush(store : Store<any>)
    {
        //
        let config = store.config
        let key = store.uuid
        if(config.meshKey) {
            config = this.getConfig(config.meshKey)
            key = config.meshKey
        }

        if(!config.highPerformance && config.flushRate <= 0) {
            return this.flushStores(key)
        }

        if(this.flushQueue[key]) {
            return //flush is already queued
        }

        if(typeof this.flushQueue[key] !== 'undefined' && !this.flushQueue[key]) {
            this.flushQueue[key] = true
            return
        }

        this.flushQueue[key] = false

        this.flushStores(key)

        if(config.highPerformance) {
            return requestAnimationFrame(this.clearFlush.bind(null, key))
        }

        setTimeout(this.clearFlush.bind(null, key), config.flushRate)
    }

    register(store : Store<any>)
    {
        store.uuid = uuid()

        if(store.config.meshKey) {
            const meshKey = store.config.meshKey
            let mesh = this.stores[meshKey]
            if(!mesh) {
                mesh = []
            }
            mesh.push(store)

            this.stores[meshKey] = mesh

            if(!this.meshValues[meshKey]) {
                this.meshValues[meshKey] = extend(true, {}, DEFAULT_MESH_CONFIG, store.config)
            }
            return
        }

        this.stores[store.uuid] = [store]
    }

    protected flushStores(key : string)
    {
        this.stores[key].forEach(store => store.flush())
    }

    protected clearFlush(key : string)
    {
        if(this.flushQueue[key]) {
            this.flushStores(key)
            this.flushQueue[key] = false

            const config = this.getConfig(key)
            if(config.highPerformance) {
                return requestAnimationFrame(this.clearFlush.bind(null, key))
            }

            return setTimeout(this.clearFlush.bind(null, key), config.flushRate)
        }

        delete this.flushQueue[key]
    }

    protected getConfig(key : string) : StoreConfig
    {
        if(typeof this.meshValues[key] !== 'undefined') {
            return this.meshValues[key]
        }

        return this.stores[key][0].config
    }

}

const Manager = new StoreManager

export default Manager