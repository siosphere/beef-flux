/**
 * 
 */

var TodoApp = React.createClass({
    getInitialState: function() {
        return {
            todos: TodoStore.getTodos()
        };
    },
    componentWillMount: function() {
        TodoStore.listen('TodoStore.event.UPDATE', this.updateTodos);
    },
    componentWillUnmount: function() {
        TodoStore.ignore('TodoStore.event.UPDATE', this.updateTodos);
    },
    render: function() {
        return <div>
            <Toolbar todos={this.state.todos} />
            <div className="container">
                <TodoList todos={this.state.todos} />
            </div>
        </div>;
    },
    updateTodos: function() {
        this.setState({
            todos: TodoStore.getTodos()
        });
    }
});