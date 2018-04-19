class Model
{
    constructor(raw : object = null)
    {
        if(raw && typeof raw === 'object') {
            for(var key in raw) {
                this[key] = raw[key]
            }
        }
    }
}

export default Model