/**
 * 
 */

var TodoList = React.createClass({
    render: function() {
        var self = this;
        var todos = this.props.todos.map(function(todo) {
            return <Todo key={todo.id} todo={todo} onChange={self.onChange} />;
        })
        
        return <ul className="todolist">
            {todos}
        </ul>;
    },
    onChange: function(todo, field, e)
    {
        var value = e.target.value;
        todo[field] = value;
        
        TodoActions.receiveTodos([todo]);
    }
});