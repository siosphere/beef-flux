/**
 * Holds a dispatcher callback function, with dependencies (array of dispatchIds)
 * that need to be called before this callback will fire. Also holds its
 * dispatchId
 */
class DispatcherCallback {
    
    public func : (...args : any []) => any;
    public dependencies:number[];
    public dispatchId:number;
    
    constructor(func : (payload : any) => any, dependencies:number[] = [], dispatchId:number)
    {
        this.func = func;
        this.dependencies = dependencies;
        this.dispatchId = dispatchId;
    }
};