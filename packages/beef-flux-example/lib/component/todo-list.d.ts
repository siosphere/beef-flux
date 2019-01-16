/// <reference types="react" />
import TodoModel from '../model/todo';
interface TodoListProps {
    todos: TodoModel[];
    toggle: (...any: any[]) => any;
}
declare const TodoList: (props: TodoListProps) => JSX.Element;
export default TodoList;
//# sourceMappingURL=todo-list.d.ts.map