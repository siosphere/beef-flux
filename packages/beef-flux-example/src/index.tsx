import * as React from 'react'
import * as ReactDOM from 'react-dom'
import TodoApp from './todo-app'
import TodoStore, {Todo} from './model/todo-store'

ReactDOM.render(<TodoApp />, document.getElementById('app'))

setTimeout(() => {
    TodoStore.seed({"state":{"todos":[{"id":"69dbff52-5c37-4093-8cc9-393f775b5c63","title":"Test","done":false,"__bID":"69dbff52-5c37-4093-8cc9-393f775b5c63"}]}})
}, 5000)