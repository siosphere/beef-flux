/// <reference path="../../../dist/typings/index.d.ts" />

import * as beef from 'beef'

const RECEIVE_TODOS : any = beef.Actions.define('RECEIVE_TODOS', (rawTodos : any []) => {
    return rawTodos
})

console.log('INCLUDED TODO ACTIONS')

export 
{
    RECEIVE_TODOS
}