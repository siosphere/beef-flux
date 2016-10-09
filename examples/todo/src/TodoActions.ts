/// <reference path="../../../dist/typings/index.d.ts" />

import * as beef from 'beef'

export const RECEIVE_TODOS : any = beef.Action('RECEIVE_TODOS', (rawTodos : any []) => {
    return rawTodos
})