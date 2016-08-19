"use strict"

jest.unmock('../../build/api/api-service');
jest.mock('jquery')

const ACTUAL_JQUERY = require.requireActual('jquery')

describe('api-service', () => {

    const Api = require('../../build/api/api-service')

    const $ = require('jquery')

    $.extend.mockImplementation((deep, configA, configB) => {
        return ACTUAL_JQUERY.extend(deep, configA, configB)
    })

    it('Api GET', () => {

        let queryData = {
            foo: 'bar'
        };

        Api.ApiService.get("test", queryData)
        expect($.ajax).toBeCalledWith({
            url: "test?foo=bar",
            method: "GET",
            dataType: "json"
        });
    })

    it('Api POST', () => {
        let postData = {
            foo: 'bar'
        }

        Api.ApiService.post("test", postData)
        expect($.ajax).toBeCalledWith({
            url: "test",
            data: JSON.stringify(postData),
            method: "POST",
            dataType: "json"
        });
    })

    it('Api PUT', () => {
        let putData = {
            foo: 'bar'
        }

        Api.ApiService.put("test", putData)
        expect($.ajax).toBeCalledWith({
            url: "test",
            data: JSON.stringify(putData),
            method: "PUT",
            dataType: "json"
        });
    })

    it('Api DELETE', () => {
        let deleteData = {
            foo: 'bar'
        }

        Api.ApiService.delete("test", deleteData)
        expect($.ajax).toBeCalledWith({
            url: "test?foo=bar",
            method: "DELETE",
            dataType: "json"
        });
    })
})