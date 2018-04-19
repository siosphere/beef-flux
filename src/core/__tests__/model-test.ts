"use strict"
jest.unmock('../model')

import Model from "../model";

describe('model', () => {

    let empty = new Model()
    it('should be an empty object', () => {
        expect(empty).toEqual({})
    })

    let filled = new Model({
        foo: 'bar'
    })
    it('should be filled', () => {
        expect(filled).toEqual({
            foo: 'bar'
        })
    })

    class CustomClass extends Model
    {
    }

    let custom = new CustomClass({
        a: 'b'
    })

    it('should allow custom classes', () => {
        expect(custom).toEqual({
            a: 'b'
        })
    })
})