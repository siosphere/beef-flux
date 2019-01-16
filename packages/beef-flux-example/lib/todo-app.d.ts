import * as React from 'react';
import TodoStore, { Todo as TodoModel, TodoStoreState } from './model/todo-store';
interface TodoAppState {
    todos: TodoModel[];
}
declare class TodoApp extends React.Component<{
    todoStore?: TodoStore;
}, TodoAppState> {
    static contextType: any;
    constructor(props: any);
    render(): JSX.Element;
    static onTodoAppUpdate(componentState: TodoAppState, nextStoreState: TodoStoreState, oldStoreState: TodoStoreState): Partial<TodoStoreState>;
}
export default TodoApp;
