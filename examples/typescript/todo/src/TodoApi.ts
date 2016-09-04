/// <reference path="../../../../dist/typings/index.d.ts" />

import beef = require('beef')
import {Todo} from "./Todo"

let Api = beef.ApiService

const URL_TODO = "#/mock/api";

export class TodoApi
{
    public static saveTodo(todo : Todo)
    {
        console.log('attempting to save TODO!')
        Api.post(URL_TODO, todo).then(() => {
            console.log('our then state, who knew?')
        }).fail(() => {
            console.log('should fail, since mock api')
        })
    }
}