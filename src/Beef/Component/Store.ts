/// <reference path="../../../lib/moment.d.ts" />
/**
 * Store that hooks into actions dispatched by a Dispatcher
 * 
 * Store holds all data and is the only class that should modify the data,
 * anything that pulls data from the DataStore cannot modify it and should treat
 * it as immutable
 */
class Store
{
    protected rows : any = {};
    
    public listen(event : string, callback : ((...args : any[]) => any))
    {
        $(window).on(event, callback);
    }
    
    public ignore(event : string, callback : ((...args : any[]) => any))
    {
        $(window).off(event, callback);
    }
    
    public emit(event : string, data : any)
    {
         $(window).trigger(event, [data]);
    }
    
    public upsertRow(modelType : string, keyField : string, keyValue : any, newRow : any)
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

                rows[index] = self.merge(rows[index], newRow);
                updated = true;
            }
        });

        if(!updated){
            this.rows[modelType].push(newRow);
        }
    }
    
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
    
    public getRows(modelType : string)
    {
        if(typeof(this.rows[modelType]) !== 'undefined'){
            return this.rows[modelType].slice(0);
        }

        return [];
    }
    
    public sanitizeAndValidate(obj : any, schema : any)
    {
        var model = this.sanitize(obj, schema, false);
        var validation = this.validate(model, schema);
        if(validation === true){
            return model;
        }
        
        return validation;
    }
    
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
    
    public sanitize(obj : any, schema : any, json : boolean) : any
    {
        var clean = {};
        var tmp = jQuery.extend(true, {}, obj);
        for(var field in schema){
            clean[field] = this.sanitizeField(field, tmp, schema, json);
        }
            
        return clean;
    }
    
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
    
    public money(value : number)
    {
        return value.toFixed(2);
    }
    
    public uuid()
    {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }
    
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
                break;
            case 'float':
            case 'double':
                return this.sanitizeFloat(obj[field], schema[field]);
                break;
            case 'string':
            case 'char':
            case 'varchar':
                return this.sanitizeString(obj[field], schema[field]);
                break;
            case 'date':
            case 'datetime':
            case 'timestamp':
                return this.sanitizeDateTime(obj[field], schema[field], json);
                break;
            case 'bool':
            case 'boolean':
                return this.sanitizeBoolean(obj[field], schema[field]);
                break;
            case 'obj':
            case 'object':
                return this.sanitizeObject(obj[field], schema[field], json);
                break;
            case 'array':
            case 'collection':
                return this.sanitizeArray(obj[field], schema[field], json);
                break;
            default:
                if(schema[field].sanitize !== 'undefined'){
                    return schema[field].sanitize(obj[field], schema[field]);
                }
                break;
        }
    }
    
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
}