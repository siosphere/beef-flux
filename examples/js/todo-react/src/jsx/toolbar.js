/**
 * 
 */

var Toolbar = React.createClass({
    render: function() {
        return <div className="toolbar">
            <ul>
                <li><a href="#/">{this.props.todos.length} Todos</a></li>
                <li><a href="#/" onClick={this.createTodo}><span className="fa fa-plus"></span> New Todo</a></li>
            </ul>
        </div>;
    },
    createTodo: function()
    {
        var todo = {
            id: TodoStore.uuid()
        };
        
        TodoActions.receiveTodos([todo]);
    }
});