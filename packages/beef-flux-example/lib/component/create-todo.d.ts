import * as React from 'react';
interface CreateTodoProps {
}
interface CreateTodoState {
    title: string;
}
declare class CreateTodo extends React.PureComponent<CreateTodoProps, CreateTodoState> {
    constructor(props: any);
    render(): JSX.Element;
    createTodo(e: any): void;
    isValid(): boolean;
}
export default CreateTodo;
