import Store from '@beef-flux/store';
declare class TodoActions extends Store.Actions {
    RECEIVE_TODOS(rawTodos: any[]): any[];
}
declare const Actions: TodoActions;
export default Actions;
