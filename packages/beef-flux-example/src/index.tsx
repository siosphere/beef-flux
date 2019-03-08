import * as React from 'react'
import * as ReactDOM from 'react-dom'
import TodoApp from './todo-app'
import Store, {ContextManager} from '@beef-flux/store'

const MyManager = new ContextManager()
ReactDOM.render(<Store.Context.Provider value={MyManager}><TodoApp /></Store.Context.Provider>, document.getElementById('app'))

setTimeout(() => {
    MyManager.seed({t: {"state":{"todos":[{"id":"69dbff52-5c37-4093-8cc9-393f775b5c63","title":"Test","done":false,"__bID":"69dbff52-5c37-4093-8cc9-393f775b5c63"}]}}})
    console.log('seeded')
}, 1000)