/**
 * Wrapper to create a consistent sdk for doing XHR requests. Will
 * automatically replace matching variables in urls that match the pattern.
 * i.e/ /my/url/{someId}/ { someId: 1 } = /my/url/1/
 */
class ApiService extends BaseService 
{
    public static SERVICE_ID : string = 'beef.service.api';
    
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
    
    public get(url : string, data : any)
    {
        return $.ajax({
            url: this._buildUrl(url, data),
            data: JSON.stringify(data),
            method: "GET",
            dataType: 'json'
        });
    }
    
    public post(url : string, data : any)
    {
        return $.ajax({
            url: this._buildUrl(url, data, false),
            data: JSON.stringify(data),
            method: "POST",
            dataType: 'json'
        });
    }
    
    public put(url : string, data : any)
    {
        return $.ajax({
            url: this._buildUrl(url, data, false),
            data: JSON.stringify(data),
            method: "PUT",
            dataType: 'json'
        });
    }
    
    public 'delete' (url : string, data : any)
    {
        return $.ajax({
            url: this._buildUrl(url, data),
            data: JSON.stringify(data),
            method: "DELETE",
            dataType: 'json'
        });
    }
    
    
    protected _buildUrl(url : string, data : any, queryString : boolean = true) 
    {
        //build the url
        for(var i in data){
            //check if URL requires data, and if provided, replace in URL.

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
}