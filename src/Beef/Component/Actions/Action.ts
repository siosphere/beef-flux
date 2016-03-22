/**
 * An action will store callbacks that apply to actionTypes it can dispatch,
 */
class Action
{
    protected _callbacks : any = {};
    
    /**
     * Register functions to actions we may contain,
     * Params should be an object where the "key" is the function that should
     * be called on "scope" when the params[key] action takes place
     */
    _register(params : any, scope : any)
    {
        for(var key in params)
        {
            var actionName = params[key].name ? params[key].name : params[key].toString().match(/^function\s*([^\s(]+)/)[1];
            if(typeof this._callbacks[actionName] === 'undefined')
            {
                this._callbacks[actionName] = [];
            }

            this._callbacks[actionName].push(scope[key].bind(scope));
        }
    }
    
    /**
     * Internal function used to dispatch a message when an action is called
     */
    _dispatch(actionName : string, fn : (...args) => any, args : any)
    {
        if(typeof this._callbacks[actionName] === 'undefined') {
            return;
        }

        var data = fn.apply(this, args);
        this._callbacks[actionName].forEach(function(callback : (...args) => any) {
            callback(data);
        });
    }
}
