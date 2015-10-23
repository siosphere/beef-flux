
Beef.Api = new function(){
    return {
        
        /**
         * Throttle function by given wait time (in ms)
         * @param {type} func
         * @param {type} wait
         * @param {type} immediate
         * @returns {Function}
         */
        throttle: function(func, wait, immediate) {
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
        },
        
        /**
         * Build the URL for get and delete methods that can't accept parameters
         * Replace magic parts of a URL, i.e. my/url/{test_id}/ would replace
         * {test_id} with the value of data.test_id
         * @param {type} url
         * @param {type} data
         * @param {bool} query_string
         * @returns {unresolved}
         */
        _buildUrl: function(url, data, query_string){
            //build the url
            for(var i in data){
                //check if URL requires data, and if provided, replace in URL.
                
                if(url.indexOf('{'+i+'}') !== -1){
                    url = url.replace('{'+i+'}', data[i]);
                    continue;
                }
                
                if(typeof(query_string) !== 'undefined' && query_string === false){
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
        },
        
        get: function(url, data){
            return $.ajax({
                url: this._buildUrl(url, data),
                data: JSON.stringify(data),
                method: "GET",
                dataType: 'json'
            });
        },
        post: function(url, data){
            return $.ajax({
                url: this._buildUrl(url, data, false),
                data: JSON.stringify(data),
                method: "POST",
                dataType: 'json'
            });
        },
        put: function(url, data){
            return $.ajax({
                url: this._buildUrl(url, data, false),
                data: JSON.stringify(data),
                method: "PUT",
                dataType: 'json'
            });
        },
        'delete': function(url, data){
            return $.ajax({
                url: this._buildUrl(url, data),
                data: JSON.stringify(data),
                method: "DELETE",
                dataType: 'json'
            });
        }
    };
};