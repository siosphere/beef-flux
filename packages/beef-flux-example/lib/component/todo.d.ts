/// <reference types="react" />
import TodoModel from '../model/todo';
interface TodoProps {
    toggle: (...any: any[]) => any;
}
declare const Todo: (props: TodoModel & TodoProps) => JSX.Element;
export default Todo;
//# sourceMappingURL=todo.d.ts.map