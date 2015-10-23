/**
 * Setup the initial Beef Namespace
 */
var Beef = new function() {
    return {
        
    };
};

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


Beef.Dispatcher = new function(){
    
    return {
        /**
         * Max number of times we can loop through all our callbacks before 
         * giving up.
         */
        max_iterations: 10,
        
        /**
         * Holds our callback objects
         */
        callbacks: [],
        
        /**
         * 
         * @param {type} callback
         * @param {type} dependencies
         * @returns {_L3.register.dispatch_id|Dispatcher.register@pro;callbacks@pro;length}register a callback with given dependencies
         * @param {function} callback
         * @param {array} dependencies
         * @returns int
         */
        register: function(callback, dependencies){
            
            var dispatch_id = this.callbacks.length;
            
            this.callbacks.push({
                func: callback,
                dependencies: dependencies,
                dispatch_id: dispatch_id
            });
            
            return dispatch_id;
        },
        
        /**
         * Dispatch a message to our registered callbacks
         * @param {string} action
         * @param {object} data
         */
        dispatch: function(action, data){
            var payload = {
                action: action,
                data: data
            };
            
            var success = [];
            var i = 0;
            var index = 0;
            while(i < Dispatcher.max_iterations && success.length < Dispatcher.callbacks.length){
                
                if(index >= Dispatcher.callbacks.length){
                    index = 0;
                    i++;
                }
                
                var callback = Dispatcher.callbacks[index];
                if(typeof(callback['dependencies']) !== 'undefined'){
                    if(success.filter(function(dispatch_index){
                        return callback.dependencies.indexOf(dispatch_index) !== -1;
                    }).length !== callback.dependencies.length){
                        continue; //waiting on a dependency
                    }
                }
                
                callback.func(payload);
                success.push(callback.dispatch_id);
                index++;
            }
            
            if(i >= Dispatcher.max_iterations){
                console.warn('Hit max dispatcher iterations, check dependencies of callbacks');
            }
        }
    };
};
/**
 * DataStore that hooks into actions dispatched by a Dispatcher
 * 
 * DataStore holds all data and is the only class that should modify the data,
 * anything that pulls data from the DataStore cannot modify it and should treat
 * it as immutable
 * 
 */

Beef.Store = new function(){
    
    $ = jQuery.noConflict();
    
    return {
        /**
         * Holds our data
         */
        rows: {},
        
        /**
         * Used to create our stores
         * i.e. var MyStore = DataStore.create({}).
         * 
         * @param {Object} config
         * @returns {undefined}
         */
        create: function(config){
            if(typeof(config) === 'undefined'){
                throw new Error('Invalid store configuration, please supply a valid Javascript Object');
            }
            
            var tmp = {};
            $.extend(true, tmp, this, config);
            return tmp;
        },
        
        /**
         * Attach a listener to an event for this store
         * 
         * @param {type} event
         * @param {type} callback
         * @returns {undefined}
         */
        listen: function(event, callback){
            $(window).on(event, callback);
        },
        
        /**
         * Detach a listener to an event for this store
         * @param {type} event
         * @param {type} callback
         * @returns {undefined}
         */
        ignore: function(event, callback){
            $(window).off(event, callback);
        },
        
        /**
         * Deprecated, use ignore instead
         * @param {type} event
         * @param {type} callback
         * @returns {undefined}
         */
        stopListen: function(event, callback){
            this.ignore(event, callback);
        },
        
        /**
         * Emit an event, supply additional data
         */
        emit: function(event, data){
            $(window).trigger(event, [data]);
        },
        
        _merge: function(obj1, obj2, depth) {
            if(typeof(depth) === 'undefined'){
                depth = 1;
            }
            var $me = this;
            
            if(depth === 3){
                return obj2;
            }
            
            for (var p in obj2) {
              try {
                // Property in destination object set; update its value.
                if ( obj2[p].constructor === Object ) {
                  obj1[p] = $me._merge(obj1[p], obj2[p], depth + 1);

                } else {
                  obj1[p] = obj2[p];
                }

              } catch(e) {
                // Property in destination object not set; create it and set its value.
                obj1[p] = obj2[p];
              }
            }

            return obj1;
        },
        
        /**
         * Update or Insert a row by key_field/key_value
         * 
         * @param {type} key_field
         * @param {type} key_value
         * @param {type} newRow
         * @returns {undefined}
         */
        upsertRow: function(model, key_field, key_value, newRow){
            var bUpdated = false;
            
            if(typeof(this.rows[model]) === 'undefined'){
                this.rows[model] = [];
            }
            
            var rows = this.rows[model];
            
            var $me = this;
            rows.forEach(function(row, index){
                if(typeof(row[key_field]) !== 'undefined' && row[key_field] === key_value){
                    if(typeof(rows[index]) === 'undefined'){
                        rows[index] = {};
                    }
                    
                    rows[index] = $me._merge(rows[index], newRow);
                    bUpdated = true;
                }
            });
            
            if(!bUpdated){
                this.rows[model].push(newRow);
            }
        },
        
        /**
         * Remove a row (or rows) if it exists by key value
         * @param {type} model
         * @param {type} key_field
         * @param {type} key_value
         * @param {type} newRow
         * @returns {undefined}
         */
        removeRow: function(model, key_field, key_value){
            if(typeof(this.rows[model]) === 'undefined'){
                return;
            }
            
            var rows = this.rows[model];
            
            var indexes = [];
            
            rows.forEach(function(row, index){
                if(typeof(row[key_field]) !== 'undefined' && row[key_field] == key_value){
                    indexes.push(index);
                }
            });
            
            if(indexes.length === 0){
                return;
            }
            
            for(i = 0; i < indexes.length; i++){
                this.rows[model].splice(indexes[i], 1);
            }
            
        },
        
        /**
         * Return rows based on model
         * @param {type} model
         * @returns {Array|DataStore.rows}
         */
        getRows: function(model){
            if(typeof(this.rows[model]) !== 'undefined'){
                return this.rows[model].slice(0);
            }
            
            return [];
        },
        
        /**
         * Sanitize and Validate an object with provided schema
         * Returns array of errors if fails validation, 
         * otherwise returns sanitized object
         * @param {type} obj
         * @param {type} schema
         * @returns {undefined}
         */
        sanitizeAndValidate: function(obj, schema){
            var model = this.sanitize(obj, schema);
            var validation = this.validate(model, schema);
            if(validation === true){
                return model;
            }
            return validation;
        },
        
        /**
         * Validate an object with provided schema, returns true if valid,
         * array of errors if not valid
         * @param {type} obj
         * @param {type} schema
         * @returns {undefined}
         */
        validate: function(obj, schema){
            var errors = [];
            for(var field in schema){
                if(typeof(schema[field].validation) !== 'undefined'){
                    var bError = false;
                    for(var validation in schema[field].validation){
                        if(bError){
                            continue; //don't keep checking
                        }
                        var value = obj[field];
                        
                        if(typeof(schema[field].label) !== 'undefined'){
                            var label = schema[field].label;
                        } else {
                            var label = field;
                        }
                        
                        switch(validation){
                            case 'required':
                                if(typeof(value) === 'undefined' || value === null || value === ''){
                                    errors.push(label + ' is required');
                                    bError = true;
                                }
                                break;
                            case 'minLength':
                                if(value.length < schema[field].validation[validation]){
                                    errors.push(label + ' must be at least ' + schema[field].validation[validation] + ' characters');
                                    bError = true;
                                }
                                break;
                            case 'maxLength':
                                if(value.length > schema[field].validation[validation]){
                                    errors.push(label + ' must be at under ' + schema[field].validation[validation] + ' characters');
                                    bError = true;
                                }
                                break;
                            default:
                                if(typeof(schema[field].validation[validation]) === 'function'){
                                    var results = schema[field].validation[validation](value);
                                    if(results !== true){
                                        errors.concat(results);
                                        bError = true;
                                    }
                                }
                                break;
                        }
                    }
                }
            }
            
            if(errors.length > 0){
                return errors;
            }
            
            return true;
        },
        
        /**
         * Sanitize the object being passed in based on the schema being passed in
         * @param {type} obj
         * @param {type} schema
         * @returns {undefined}
         */
        sanitize: function(obj, schema, json){
            var clean = {};
            var tmp = jQuery.extend(true, {}, obj);
            for(var field in schema){
                clean[field] = this._sanitizeField(field, tmp, schema, json);
            }
            
            return clean;
        },
        
        /**
         * Santize a given field
         */
        _sanitizeField: function(field, obj, schema, json){
            
            if(schema[field].type === 'function'){
                return schema[field].value; //return function
            }
            
            if(typeof(obj[field]) === 'undefined'){
                //see if schema has a default
                if(typeof(schema[field]['initial']) !== 'undefined'){
                    obj[field] = schema[field]['initial']();
                } else {
                    obj[field] = null;
                }
            }
            var type = schema[field]['type'];
            if(obj[field] === null && type !== 'obj' && type !== 'object'){
                return null;
            }
            
            schema[field].field = field;
            
            switch(type){
                case 'int':
                case 'integer':
                    return this._sanitizeInteger(obj[field], schema[field]);
                    break;
                case 'float':
                case 'double':
                    return this._sanitizeFloat(obj[field], schema[field]);
                    break;
                case 'string':
                case 'char':
                case 'varchar':
                    return this._sanitizeString(obj[field], schema[field]);
                    break;
                case 'date':
                case 'datetime':
                case 'timestamp':
                    return this._sanitizeDateTime(obj[field], schema[field], json);
                    break;
                case 'bool':
                case 'boolean':
                    return this._sanitizeBoolean(obj[field], schema[field]);
                    break;
                case 'obj':
                case 'object':
                    return this._sanitizeObject(obj[field], schema[field], json);
                    break;
                case 'array':
                case 'collection':
                    return this._sanitizeArray(obj[field], schema[field]);
                    break;
                default:
                    if(schema[field].sanitize !== 'undefined'){
                        return schema[field].sanitize(obj[field], schema[field]);
                    }
                    break;
            }
            
        },

        /**
         * Sanitize value as integer
         * @param {type} value
         * @param {type} schemaConfig
         * @returns {_L11._sanitizeInteger.value}
         */
        _sanitizeInteger: function(value, schemaConfig){
            if(typeof value === 'string'){
                value = value.replace(/[a-zA-Z]+/gi, '');
                if(value.length === 0){
                    return value = '';
                }
            }
            
            value = parseInt(value);
            
            if(typeof(schemaConfig.min) !== 'undefined' && value < schemaConfig.min){
                throw new Error('Provided value cannot be sanitized, value is below minimum integer allowed');
            }
            if(typeof(schemaConfig.max) !== 'undefined' && value > schemaConfig.max){
                throw new Error('Provided value cannot be sanitized, value is greater than maximum integer allowed');
            }
            
            if(isNaN(value)){
                return value = '';
            }

            return value;
        },

        /**
         * Sanitize value as float
         * @param {type} value
         * @param {type} schemaConfig
         * @returns {_L11._sanitizeInteger.value}
         */
        _sanitizeFloat: function(value, schemaConfig){
            value = parseFloat(value);
            if(typeof(schemaConfig.min) !== 'undefined' && value < schemaConfig.min){
                throw new Error('Provided value cannot be sanitized, value is below minimum float allowed');
            }
            if(typeof(schemaConfig.max) !== 'undefined' && value > schemaConfig.max){
                throw new Error('Provided value cannot be sanitized, value is greater than maximum float allowed');
            }

            return value;
        },
        
        /**
         * Sanitize a String
         * @param {type} value
         * @param {type} schemaConfig
         * @returns {_L11._sanitizeString.value}
         */
        _sanitizeString: function(value, schemaConfig){
            value = String(value);
            if(typeof(schemaConfig.minLength) !== 'undefined' && value.length < schemaConfig.minLength){
                throw new Error('Provided value cannot be sanitized, string length is below minimum allowed');
            }
            if(typeof(schemaConfig.maxLength) !== 'undefined' && value.length > schemaConfig.maxLength){
                //truncate and do a warning
                console.warn('Value was truncated during sanitation');
                value = value.substr(0, schemaConfig.maxLength);
            }
            return value;
        },
        
        /**
         * Sanitize a datetime
         * @param {type} value
         * @param {type} schemaConfig
         * @returns {unresolved}
         */
        _sanitizeDateTime: function(value, schemaConfig, json){
            
            if(moment(value, schemaConfig.format).isValid()){
                if(json){
                    return moment(value).utc().format('YYYY-MM-DD hh:mm:ss');
                }
                if(typeof schemaConfig.utc === 'undefined' || schemaConfig.utc){
                    return moment.utc(value);
                }
                return moment(value);
            }
            
            throw new Error("Provided value ("+ value +") cannot be sanitized for field ("+ schemaConfig.field +"), is not a valid date");
        },
        
        /**
         * Sanitize Boolean
         * @param {type} value
         * @param {type} schemaConfig
         * @returns {Boolean}
         */
        _sanitizeBoolean: function(value, schemaConfig){
            if(value === false || value === true){
                return value;
            }
            if(typeof(value) == 'string'){
                if(value.toLowerCase().trim() === 'false'){
                    return false;
                }
                if(value.toLowerCase().trim() === 'true'){
                    return true;
                }
            }
            if(parseInt(value) === 0){
                return false;
            }
            if(parseInt(value) === 1){
                return true;
            }
            
            throw new Error('Provided value cannot be santized, is not a valid boolean');
        },
        
        /**
         * Sanitize an Object
         * @param {type} value
         * @param {type} schemaConfig
         * @returns {_L11.sanitize.clean|DataStore.sanitize@call;_sanitizeField|undefined}
         */
        _sanitizeObject: function(value, schemaConfig, json){
            if(typeof(schemaConfig.schema) === 'undefined'){
                throw new Error('Provided value cannot be santized, no reference schema provided for field type of object');
            }
            
            if(schemaConfig.schema === null){
                return value;
            }
            
            if(value === null){
                return null;
            }
            
            return this.sanitize(value, schemaConfig.schema());
        },
        
        /**
         * Sanitize an Array, with a given schema or type if needed
         * @param {type} value
         * @param {type} schemaConfig
         * @returns {_L11.sanitize.clean|DataStore.sanitize@call;_sanitizeField|undefined}
         */
        _sanitizeArray: function(value, schemaConfig){
            if(typeof(schemaConfig.schema) === 'undefined' || schemaConfig.schema === null || schemaConfig.schema === false){
                return value;
            }
            
            if(typeof(value.length) === 'undefined'){
                return []; //empty array
            }
            
            var $me = this;
            
            return value.map(function(v){
                return $me.sanitize(v, schemaConfig.schema());
            });
        },
        
        /**
         * Generate a unique UUID
         * @returns {String}
         */
        uuid: function(){
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        },
        
        /**
         * Sort by a given field in a given direction
         */
        sortBy: function(key, dir){
            
            return function(a, b){
                var dir = dir ? dir : 'desc';
                
                if((b[key] && !a[key]) || (b[key] && a[key] && b[key] > a[key])){
                    return dir.toLowerCase() === 'desc' ? 1 : -1;
                }
                
                if((!b[key] && a[key]) || (b[key] && a[key] && b[key] < a[key])){
                    return dir.toLowerCase() === 'desc' ? -1 : 1;
                }
                
                if(b[key] && a[key] && b[key] == a[key]){
                    return 0;
                }
                
                if(b[key] && !a[key]){
                    return 0;
                }
            };
            
        },
        
        /**
         * format something as money
         * @param {type} value
         * @returns {unresolved}
         */
        money: function(value) {
            return value.toFixed(2);
        }
        
    };
};