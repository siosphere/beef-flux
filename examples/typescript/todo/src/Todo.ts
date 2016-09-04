/// <reference path="../../../../dist/typings/index.d.ts" />

import beef = require('beef')

export class Todo
{
    public static schema : any = {}

    @beef.Schema.uuid()
    id : string

    @beef.Schema.string({
         initial: () => { return '' }
    })
    name : string

    constructor(properties : any = {})
    {
        for(var key in properties) {
            this[key] = properties
        }
    }
}