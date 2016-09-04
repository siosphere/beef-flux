"use strict"
jest.unmock('../../build/api/api-service');

describe('api-service', () => {

    const Api = require('../../build/api/api-service')

    const reqwest = require('reqwest')

    it('Api GET', () => {

        let queryData = {
            foo: 'bar'
        };

        Api.ApiService.get("test", queryData)
        expect(reqwest).toBeCalledWith({
            url: "test?foo=bar",
            method: "get"
        });
    })

    it('Api POST', () => {
        let postData = {
            foo: 'bar'
        }

        Api.ApiService.post("test", postData)
        expect(reqwest).toBeCalledWith({
            url: "test",
            data: JSON.stringify(postData),
            method: "post",
            contentType: 'application/json'
        });
    })

    it('Api PUT', () => {
        let putData = {
            foo: 'bar'
        }

        Api.ApiService.put("test", putData)
        expect(reqwest).toBeCalledWith({
            url: "test",
            data: JSON.stringify(putData),
            method: "put",
            contentType: 'application/json'
        });
    })

    it('Api DELETE', () => {
        let deleteData = {
            foo: 'bar'
        }

        Api.ApiService.delete("test", deleteData)
        expect(reqwest).toBeCalledWith({
            url: "test?foo=bar",
            method: "delete"
        });
    })
})