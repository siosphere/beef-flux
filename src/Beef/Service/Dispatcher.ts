/**
 * Used to dispatch messages to any registered listeners
 */
class Dispatcher extends BaseService
{
    protected SERVICE_ID : string = 'beef.service.dispatcher';
    protected maxIterations : number = 10;
    
    protected callbacks : DispatcherCallback[];
    
    public register(callback : (payload: any) => any, dependencies:number[]) : number
    {
        var dispatchId = this.callbacks.length;
        this.callbacks.push(new DispatcherCallback(callback, dependencies, dispatchId));
        
        return dispatchId;
    }
    
    public dispatch(action : string, data : any)
    {
        var payload = new DispatcherPayload(action, data);

        var success = [];
        var i = 0;
        var index = 0;
        while(i < this.maxIterations && success.length < this.callbacks.length){

            if(index >= this.callbacks.length){
                index = 0;
                i++;
            }

            var callback = this.callbacks[index];
            if(success.filter(function(dispatch_index){
                return callback.dependencies.indexOf(dispatch_index) !== -1;
            }).length !== callback.dependencies.length){
                continue; //waiting on a dependency
            }

            callback.func(payload);
            success.push(callback.dispatchId);
            index++;
        }

        if(i >= this.maxIterations){
            console.warn('Hit max dispatcher iterations, check dependencies of callbacks');
        }
    }
}