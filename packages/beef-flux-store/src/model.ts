abstract class Model
{
    create(raw : object = null)
    {
        if(raw && typeof raw === 'object') {
            Object.assign(this, raw)
        }
    }
}

export default Model