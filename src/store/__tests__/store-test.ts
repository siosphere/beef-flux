"use strict"
jest.unmock('../store')
jest.unmock('../../action/actions')
jest.unmock('lodash/assign')
jest.unmock('lodash/cloneDeepWith')
jest.unmock('lodash/merge')
jest.unmock('extend')

import Store from '../store'
import Actions from '../../action/actions'
interface TestStoreState
{
    items : any[]
}

const RECEIVE_ITEMS : any = Actions.define('RECEIVE_ITEMS', (rawItems : any[]) => {
    return rawItems
})

class TestStoreClass extends Store<TestStoreState>
{
    public listeners
    public state

    constructor()
    {
        super();

        this.state = {
            items: []
        }

        this.createItem = this.createItem.bind(this)
        this.receiveItems = this.receiveItems.bind(this)
        Actions.register<TestStoreState>({
            [RECEIVE_ITEMS]: this.receiveItems
        }, this)
    }

    createItem(id : number, title : string)
    {
        let item = {
            id: id,
            title: title
        }

        RECEIVE_ITEMS([item])
    }

    receiveItems(items)
    {
        let nextState = this.nextState()

        items.forEach((item : any) => {
            this.upsertItem(nextState.items, item.id, item, true)
        })

        return nextState
    }
}

const TestStore = new TestStoreClass()

describe('store', () => {
    const defaultState = {
        items: []
    }

    it('should have empty state', () => {
        expect(TestStore.state).toEqual(defaultState)
    })
    
    let currentState = null

    const listener = jest.fn()

    TestStore.listen(listener)

    it('should have 1 listener', () => {
        expect(TestStore.listeners.length).toEqual(1)
    })

    const stateTwo = {
        items: [{
            __bID: 1,
            id: 1,
            title: 'test'
        }]
    }

    it('should do a state change and inform our listener only once', () => {
        TestStore.createItem(1, "test")
        expect(listener).lastCalledWith(stateTwo, defaultState)
        expect(listener.mock.calls.length).toBe(1)
    })

    it('should match our updated state', () => {
        expect(TestStore.state).toEqual(stateTwo)
    })
})