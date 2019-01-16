import moment = require("moment");
interface BaseConfig<T> {
    initial: (...any: any[]) => T;
}
interface NumberConfig {
    min?: number;
    max?: number;
}
interface StringConfig {
    minLength?: number;
    maxLength?: number;
}
interface DateConfig {
    utc?: boolean;
    format?: string;
}
interface ObjectConfig<T> {
    schema: null | ((...any: any[]) => object);
    constructor?: (...any: any[]) => T;
}
declare type arrayMember = "int" | "float" | "string" | "date" | "bool" | "object" | "array" | "callback" | "custom";
interface ArrayConfig<T> {
    memberType?: arrayMember;
    memberTypeConfig?: BaseConfig<T> | (BaseConfig<T> & NumberConfig) | (BaseConfig<T> & StringConfig) | (BaseConfig<T> & DateConfig) | (BaseConfig<T> & ObjectConfig<T>);
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
declare class Schema {
    static int(config?: BaseConfig<number> & NumberConfig): any;
    static string(config?: BaseConfig<string> & StringConfig): any;
    static bool(config?: BaseConfig<boolean>): any;
    static float(config?: BaseConfig<number> & NumberConfig): any;
    static double(config?: BaseConfig<number> & NumberConfig): any;
    static array<T>(config?: BaseConfig<T[]> & ArrayConfig<T> & ObjectConfig<T>): any;
    static object<T>(config?: BaseConfig<T> & ObjectConfig<T>): any;
    static datetime(config?: BaseConfig<moment.Moment> & DateConfig): any;
    static callback(config?: BaseConfig<(...any: any[]) => any>): any;
    static custom<T>(config?: BaseConfig<T>): any;
    static uuid(config?: BaseConfig<string>): any;
}
export default Schema;
