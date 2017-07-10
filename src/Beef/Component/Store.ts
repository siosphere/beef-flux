/**
 * Store that hooks into actions dispatched by a Dispatcher
 * 
 * Store holds all data and is the only class that should modify the data,
 * anything that pulls data from the DataStore cannot modify it and should treat
 * it as immutable
 */
class Store
{
    /**
     * Holds all of our rows by modelType
     */
    protected rows : any = {};
    
    public actions = function() : void {
        //setup any actions
    };
    
    /**
     * When registering a dispatcher, this becomes our callback index used
     * for dependency resolution
     */
    public dispatchIndex : number = null;
    
    /**
     * Listen on a given event
     */
    public listen(event : string, callback : ((...args : any[]) => any))
    {
        jQuery(window).on(event, callback);
    }
    
    /**
     * Ignore an event we are listening on
     */
    public ignore(event : string, callback : ((...args : any[]) => any))
    {
        jQuery(window).off(event, callback);
    }
    
    /**
     * Emit an event
     */
    public emit(event : string, data : any = false)
    {
         jQuery(window).trigger(event, [data]);
    }
    
    /**
     * Insert a row if it doesn't exist, update it otherwise
     */
    public upsertRow(modelType : string, keyField : string, keyValue : any, newRow : any, overwrite : boolean = false)
    {
        var updated : boolean = false;
        
        if(typeof(this.rows[modelType]) === 'undefined'){
            this.rows[modelType] = [];
        }
        
        var rows = this.rows[modelType];
            
        var self = this;
        rows.forEach(function(row, index){
            if(typeof(row[keyField]) !== 'undefined' && row[keyField] === keyValue){
                if(typeof(rows[index]) === 'undefined'){
                    rows[index] = {};
                }

                rows[index] = overwrite ? rows[index] = newRow : self.merge(rows[index], newRow);
                updated = true;
            }
        });

        if(!updated){
            this.rows[modelType].push(newRow);
        }
    }
    
    /**
     * Remove a row
     */
    public removeRow(modelType : string, keyField : string, keyValue : any)
    {
        if(typeof(this.rows[modelType]) === 'undefined'){
            return;
        }

        var rows = this.rows[modelType];

        var indexes = [];

        rows.forEach(function(row, index){
            if(typeof(row[keyField]) !== 'undefined' && row[keyField] == keyValue){
                indexes.push(index);
            }
        });

        if(indexes.length === 0){
            return;
        }

        for(var i = 0; i < indexes.length; i++){
            this.rows[modelType].splice(indexes[i], 1);
        }
    }
    
    /**
     * Pass in an array of keyValues and remove all rows that match
     */
    public removeRows(modelType : string, keyField : string, keyValues : any[]) {
        var self = this;
        keyValues.forEach(function(keyValue) {
            self.removeRow(modelType, keyField, keyValue);
        });
    }
    
    /**
     * Clear our store of the given modelType
     */
    public clearAll(modelType : string) {
        this.rows[modelType] = [];
    }
    
    /**
     * Get rows of the given modelType
     */
    public getRows(modelType : string, noSlice : boolean = true)
    {
        if(typeof(this.rows[modelType]) !== 'undefined'){
            return noSlice ? this.rows[modelType] : this.rows[modelType].slice(0);
        }

        return [];
    }
    
    /**
     * Sanitize and valide the given object to the given schema
     */
    public sanitizeAndValidate(obj : any, schema : any)
    {
        var model = this.sanitize(obj, schema, false);
        var validation = this.validate(model, schema);
        if(validation === true){
            return model;
        }
        
        return validation;
    }
    
    /**
     * Validate the given object to the given schema, will return an array
     * of errors, or true if valid
     */
    public validate(obj : any, schema : any) : any
    {
        var errors : string[] = [];
        
        for(var field in schema) {
            if(typeof(schema[field].validation) !== 'undefined'){
                for(var validation in schema[field].validation) {
                    if(errors.length > 0) {
                        break;
                    }
                    var value = obj[field];
                    
                    var label = schema[field].label ? schema[field].label : field;
                    
                    switch(validation) {
                        case 'required':
                            if(typeof(value) === 'undefined' || value === null || value === ''){
                                errors.push(label + ' is required');
                            }
                        break;
                        case 'minLength':
                            if(value.length < schema[field].validation[validation]){
                                errors.push(label + ' must be at least ' + schema[field].validation[validation] + ' characters');
                            }
                        break;
                        case 'maxLength':
                            if(value.length > schema[field].validation[validation]){
                                errors.push(label + ' must be at under ' + schema[field].validation[validation] + ' characters');
                            }
                        break;
                        default:
                            if(typeof(schema[field].validation[validation]) === 'function'){
                                var results = schema[field].validation[validation](value);
                                if(results !== true){
                                    errors.concat(results);
                                }
                            }
                        break;
                        
                    }
                }
            }
        }
        
        return errors.length > 0 ? errors : true;
    }
    
    /**
     * Sanitize the given object to a schema, also an optional parameter if
     * you are sending the object as JSON, to format datetimes properly
     */
    public sanitize(obj : any, schema : any, json : boolean = false) : any
    {
        var clean = {};
        var tmp = jQuery.extend(true, {}, obj);
        for(var field in schema){
            clean[field] = this.sanitizeField(field, tmp, schema, json);
        }
            
        return clean;
    }
    
    /**
     * Merge objects together to a given depth
     */
    public merge(obj1 : any, obj2 : any, depth : number = 1) 
    {

        var self = this;

        if(depth === 3){
           return obj2;
        }

        for (var p in obj2) {
          try {
            // Property in destination object set; update its value.
            if ( obj2[p].constructor === Object ) {
              obj1[p] = self.merge(obj1[p], obj2[p], depth + 1);

            } else {
              obj1[p] = obj2[p];
            }

          } catch(e) {
            // Property in destination object not set; create it and set its value.
            obj1[p] = obj2[p];
          }
        }

        return obj1;
    }
    
    /**
     * Creates a filter sort callback to sort by a given key
     */
    public sortBy(key : string, dir : string = 'desc')
    {
        return function(a, b){

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
    }
    
    /**
     * Formats a given number to two decimal places
     */
    public money(value : number)
    {
        return value.toFixed(2);
    }
    
    /**
     * Generates a UUID
     */
    public uuid()
    {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }
    
    public static string(params = {}) {
        return jQuery.extend(true, {
            type: 'string'
        }, params);
    }
    
    public static int(params = {}) {
        return jQuery.extend(true, {
            type: 'int'
        }, params);
    }
    
    public static double(params = {}) {
        return jQuery.extend(true, {
            type: 'double'
        }, params);
    }
    public static bool(params = {}) {
        return jQuery.extend(true, {
            type: 'bool'
        }, params);
    }
    
    public static float(params = {}) {
        return jQuery.extend(true, {
            type: 'float'
        }, params);
    }
    
    public static array (params = {}) {
        return jQuery.extend(true, {
            type: 'array',
            schema: null
        }, params);
    }
    public static object (params = {}) {
        return jQuery.extend(true, {
            type: 'object',
            schema: null
        }, params);
    }
    
    public static datetime (params = {}) {
        return jQuery.extend(true, {
            type: 'datetime',
            schema: null,
            format: 'YYYY-MM-DD HH:mm:ss'
        }, params);
    }
    public static callback(params = {}) {
        return jQuery.extend(true, {
            type: 'callback',
            schema: null
        }, params);
    }
    
    /**
     * Sanitizes a field on an object to the given schema
     */
    protected sanitizeField(field : string, obj : any, schema : any, json : boolean)
    {
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
                return this.sanitizeInteger(obj[field], schema[field]);
            case 'float':
            case 'double':
                return this.sanitizeFloat(obj[field], schema[field]);
            case 'string':
            case 'char':
            case 'varchar':
                return this.sanitizeString(obj[field], schema[field]);
            case 'date':
            case 'datetime':
            case 'timestamp':
                return this.sanitizeDateTime(obj[field], schema[field], json);
            case 'bool':
            case 'boolean':
                return this.sanitizeBoolean(obj[field], schema[field]);
            case 'obj':
            case 'object':
                return this.sanitizeObject(obj[field], schema[field], json);
            case 'array':
            case 'collection':
                return this.sanitizeArray(obj[field], schema[field], json);
            default:
                if(schema[field].sanitize !== 'undefined'){
                    return schema[field].sanitize(obj[field], schema[field]);
                }
                break;
        }
    }
    
    /**
     * Sanitizes a field to an integer
     */
    protected sanitizeInteger(value : any, schemaConfig : any)
    {
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
    }
    
    /**
     * Sanitizes a field to a float
     */
    protected sanitizeFloat(value : any, schemaConfig : any)
    {
        value = parseFloat(value);
        if(typeof(schemaConfig.min) !== 'undefined' && value < schemaConfig.min){
            throw new Error('Provided value cannot be sanitized, value is below minimum float allowed');
        }
        if(typeof(schemaConfig.max) !== 'undefined' && value > schemaConfig.max){
            throw new Error('Provided value cannot be sanitized, value is greater than maximum float allowed');
        }

        return value;
    }
    
    /**
     * Sanitizes a field to a string
     */
    protected sanitizeString(value : any, schemaConfig : any)
    {
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
    }
    
    /**
     * Sanitizes a field to a moment object
     */
    protected sanitizeDateTime(value : any, schemaConfig : any, json : boolean) : any
    {
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
    }
    
    /**
     * Sanitizes a field to boolean
     */
    protected sanitizeBoolean(value : any, schemaConfig : any)
    {
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
    }
    
    /**
     * Sanitizes an object
     */
    protected sanitizeObject(value : any, schemaConfig : any, json : boolean)
    {
        if(typeof(schemaConfig.schema) === 'undefined'){
            throw new Error('Provided value cannot be santized, no reference schema provided for field type of object');
        }

        if(schemaConfig.schema === null){
            return value;
        }

        if(value === null){
            return null;
        }

        return this.sanitize(value, schemaConfig.schema(), json);
    }
    
    /**
     * Sanitizes an array of objects
     */
    protected sanitizeArray(value : any, schemaConfig : any, json : boolean)
    {
        if(typeof(schemaConfig.schema) === 'undefined' || schemaConfig.schema === null || schemaConfig.schema === false){
            return value;
        }

        if(typeof(value.length) === 'undefined'){
            return []; //empty array
        }

        var $me = this;

        return value.map(function(v){
            return $me.sanitize(v, schemaConfig.schema(), json);
        });
    }
    
    /**
     * Gets the dispatcher
     */
    protected getDispatcher() : Dispatcher {
        return Beef.service(Dispatcher.SERVICE_ID);
    }
}

window['Store'] = Store