

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