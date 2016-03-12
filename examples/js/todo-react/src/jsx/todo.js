/**
 * 
 */


var Todo = React.createClass({
    getInitialState: function()
    {
        return {
            editing: false
        };
    },
    
    render: function() {
        var todo = this.props.todo;
        var title = this.state.editing ? <EditTitle value={todo.title} onBlur={this.toggleEditing} onChange={this.props.onChange.bind(null, todo, 'title')} /> : <Title onClick={this.toggleEditing} value={todo.title} />;
        return <li>
            {title}
        </li>;
    },
    toggleEditing: function() {
        this.setState({
            editing: !this.state.editing
        });
    }
});

var EditTitle = React.createClass({
    focus: function(input) {
        if (input != null) {
            input.focus();
        }
    },
    render: function()
    {
        return <input ref={this.focus} type="text" value={this.props.value} onChange={this.props.onChange} onBlur={this.props.onBlur} />
    }
});

var Title = React.createClass({
    render: function()
    {
        var value = this.props.value.length > 0 ? this.props.value : 'Untitled';
        return <span onClick={this.props.onClick}>{value}</span>;
    }
});