
/**
 * The payload that will be sent to the dispatch callback
 */
class DispatcherPayload
{
    public action : string;
    public data : any;
    
    constructor(action : string, data : any)
    {
        this.action = action;
        this.data = data;
    }
}