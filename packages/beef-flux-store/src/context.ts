import * as React from 'react'

/**
 * Move manager to a separate class
 * For seeding use manager to get the store (no prefix) which will create if needed and then seed.
 */
export class Manager
{
	stores : any = {}
	initialStates : any = {}
	
	constructor() {
		this.getStore = this.getStore.bind(this)
		this.dump = this.dump.bind(this)
		this.seed = this.seed.bind(this)
	}

	getStore(storeName, storeType)
	{
		if(typeof this.stores[storeName] !== 'undefined') {
			return this.stores[storeName]
		}

		if(!storeType) {
			return null
		}

		let store = this.stores[storeName] = new storeType()
		if(typeof this.initialStates[storeName] !== 'undefined') {
			let storeStates = this.initialStates[storeName]
			delete this.initialStates[storeName]
			storeStates.forEach((storeState) => store.seed(storeState))
		}

		return store
	}

	dump()
	{
		let state = {}
		for(let storeName in this.stores) {
			let store = this.stores[storeName]
			state[storeName] = store.dump()
		}

		return state
	}

	seed(state) {
		for(let storeName in state) {
			let storeState = state[storeName]
			let store = this.getStore(storeName, null)
			if(store) {
				store.seed(storeState)
			} else {
				if(typeof this.initialStates[storeName] === 'undefined') {
					this.initialStates[storeName] = []
				}
				this.initialStates[storeName].push(storeState)
			}
		}
	}
}

const StoreContext = React.createContext(new Manager);

export default StoreContext