import Store from '@beef-flux/store';
import Todo from './todo';
interface TodoStoreState {
    todos: Todo[];
}
declare class TodoStore extends Store.BaseStore<TodoStoreState> {
    constructor();
    sanitizeTodo(rawTodo: any): Todo;
    protected onReceiveTodos(rawTodos: any[]): TodoStoreState;
}
export default TodoStore;
export { Todo, TodoStoreState };
