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
declare const instance: TodoStore;
export default instance;
export { Todo, TodoStoreState };
//# sourceMappingURL=todo-store.d.ts.map