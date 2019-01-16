import extend = require('extend')

/**
 * Wrapper to create a consistent sdk for doing XHR requests. Will
 * automatically replace matching variables in urls that match the pattern.
 * i.e/ /my/url/{someId}/ { someId: 1 } = /my/url/1/
 */
export class ApiServiceClass
{   
    public throttle(func : () => any, wait : number, immediate : boolean) 
    {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
    
    public get(url : string, data : any, config : RequestInit = null) : Promise<Response>
    {
        let params : RequestInit = this._buildConfig({
            method: "GET",
            mode: "no-cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Accept": "application/json"
            },
            redirect: "follow",
            referrer: "no-referrer"
        }, config)

        return fetch(this._buildUrl(url, data), params)
    }
    
    public post(url : string, data : any, config : RequestInit = null)
    {
        let params : RequestInit = this._buildConfig({
            method: "POST",
            mode: "no-cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json; charset=utf-8"
            },
            redirect: "follow",
            referrer: "no-referrer",
            body: JSON.stringify(data)
        }, config)

        return fetch(this._buildUrl(url, data, false), params)
    }
    
    public put(url : string, data : any, config : RequestInit = null)
    {
        let params : RequestInit = this._buildConfig({
            method: "PUT",
            mode: "no-cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json; charset=utf-8"
            },
            redirect: "follow",
            referrer: "no-referrer",
            body: JSON.stringify(data)
        }, config)

        return fetch(this._buildUrl(url, data, false), params)
    }
    
    public ['delete'](url : string, data : any, config : RequestInit = null)
    {
        let params : RequestInit = this._buildConfig({
            method: "DELETE",
            mode: "no-cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Accept": "application/json"
            },
            redirect: "follow",
            referrer: "no-referrer"
        }, config)

        return fetch(this._buildUrl(url, data), params)
    }
    
    
    protected _buildUrl(url : string, data : any, queryString : boolean = true) 
    {
        //build the url
        for(var i in data) {
            if(url.indexOf('{'+i+'}') !== -1){
                url = url.replace('{'+i+'}', data[i]);
                continue;
            }

            if(queryString === false){
                continue;
            }

            if(url.indexOf('?') !== -1){
                url += '&';
            } else {
                url += '?';
            }

            url += i + '=' + data[i];
        }

        return url;
    }

    protected _buildConfig(defaultConfig : any, customConfig : any = {}) : any
    {
        if(customConfig === null) {
            return defaultConfig
        }

        return extend(true, {}, defaultConfig, customConfig)
    }
}

let ApiService = new ApiServiceClass()

export
{
    ApiService
}