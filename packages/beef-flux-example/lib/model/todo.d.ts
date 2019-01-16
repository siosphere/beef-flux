import Store from '@beef-flux/store';
declare class Todo extends Store.Model {
    static schema: {};
    id: string;
    title: string;
    done: boolean;
}
export default Todo;
