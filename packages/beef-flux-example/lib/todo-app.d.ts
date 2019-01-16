import * as React from 'react';
import { Todo as TodoModel, TodoStoreState } from './model/todo-store';
interface TodoAppState {
    todos: TodoModel[];
}
declare class TodoApp extends React.Component<{}, TodoAppState> {
    constructor(props: any);
    render(): JSX.Element;
    static onTodoAppUpdate(componentState: TodoAppState, nextStoreState: TodoStoreState, oldStoreState: TodoStoreState): Partial<TodoStoreState>;
}
export default TodoApp;
//# sourceMappingURL=todo-app.d.ts.map