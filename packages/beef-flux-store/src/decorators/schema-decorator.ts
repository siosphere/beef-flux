import Store from "../base-store"
import {uuid} from '../util'
import moment = require("moment");

interface BaseConfig<T>
{
    initial : (...any) => T
    primaryKey ?: boolean
}

interface NumberConfig
{
    min ?: number
    max ?: number
}

interface StringConfig
{
    minLength ?: number
    maxLength ?: number
}

interface DateConfig
{
    utc ?: boolean
    format ?: string
}

interface ObjectConfig<T>
{
    schema : null | ((...any) => object)
    factory ?: (raw : object) => T
    reference ?: boolean
}

type arrayMember = "int" | "float" | "string" | "date" | "bool" | "object" | "array" | "callback" | "custom"

interface ArrayConfig<T>
{
    memberType ?: arrayMember
    memberTypeConfig ?: BaseConfig<T> | BaseConfig<T> & NumberConfig | BaseConfig<T> & StringConfig | BaseConfig<T> & DateConfig | BaseConfig<T> & ObjectConfig<T>
}

/**
 * This is used to build a schema from a typescript class without having to
 * redefine all the fields.
 * 
 * Usage:
 * 
 * class MyAwesomeObject
 * {
 *     public static schema = {}
 *     
 *     @Schema.int()
 *     myAwesomeField : number
 *     
 *     @Schema.object({
 *         schema: () => {
 *             return SomeOtherObject.schema
 *         }
 *     })
 *     myAwesomeObject : any
 * }
 */
class Schema
{
    public static int(config : BaseConfig<number> & NumberConfig = null)
    {
        return setupFunction.bind(null, Store.int.bind(null, config))
    }

    public static string(config : BaseConfig<string> & StringConfig = null)
    {
        return setupFunction.bind(null, Store.string.bind(null, config))
    }

    public static bool(config : BaseConfig<boolean> = null)
    {
        return setupFunction.bind(null, Store.bool.bind(null, config))
    }

    public static float(config : BaseConfig<number> & NumberConfig = null)
    {
        return setupFunction.bind(null, Store.float.bind(null, config))
    }

    public static double(config : BaseConfig<number> & NumberConfig = null)
    {
        return Schema.float(config)
    }

    public static array<T>(config : BaseConfig<T[]> & ArrayConfig<T> & ObjectConfig<T> = null)
    {
        return setupFunction.bind(null, Store.array.bind(null, config))
    }

    public static object<T>(config : BaseConfig<T> & ObjectConfig<T> = null)
    {
        return setupFunction.bind(null, Store.object.bind(null, config))
    }

    public static datetime(config : BaseConfig<moment.Moment> & DateConfig = null)
    {
        return setupFunction.bind(null, Store.datetime.bind(null, config))
    }

    public static callback(config : BaseConfig<(...any) => any> = null)
    {
        return setupFunction.bind(null, Store.callback.bind(null, config))
    }

    public static custom<T>(config : BaseConfig<T> = null)
    {
        return setupFunction.bind(null, Store.customType.bind(null, config))
    }

    public static uuid(config : BaseConfig<string> = { initial: null })
    {
        config.initial = ()  => {
            return uuid()
        }
        
        return setupFunction.bind(null, Store.string.bind(null, config));
    }
}

const setupFunction = (storeCallback : any, target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    
    target.constructor.schema[propertyKey] = storeCallback();
}


export default Schema