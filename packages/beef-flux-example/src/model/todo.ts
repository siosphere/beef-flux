import Store, {Schema} from '@beef-flux/store'

class Todo extends Store.Model
{
    public static schema = {}

    @Schema.uuid()
    id : string

    @Schema.string()
    title : string

    @Schema.bool({
        initial: () => false
    })
    done : boolean
}

export default Todo