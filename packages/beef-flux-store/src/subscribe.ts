
export interface SubscribeMap {
	[s: string]: (componentState : any, nextState : any, oldState : any) => any
}

const subscribe = (storeMap : SubscribeMap) =>
{
	for(let storeName in storeMap) {
		let cb = storeMap[storeName]
		return subscribeTo.bind(this, storeName, cb)
	}
}

function subscribeTo<S, P extends {new(...args:any[]):{}}>(storeName : string, cb : (componentState : S, nextState : any, oldState : any) => any, constructor : P)
{
	return class extends constructor {

		__listeners : number[] = []

		componentDidMount()
		{
			super['componentDidMount'] ? super['componentDidMount']() : null
			this.__listeners.push(this['props'][storeName].listen((nextState, oldState) => this['setState'](cb(this['state'], nextState, oldState))))
		}

		componentWillUnmount()
		{
			super['componentWillUnmount'] ? super['componentWillUnmount']() : null
			this.__listeners.forEach(index => {
				this['props'][storeName].ignore(index)
			})
		}
	}
}

export default subscribe