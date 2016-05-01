/**
 * 
 */

var AppContainer = React.createClass({
    getInitialState: function() {
        return {
            url: window.location.hash
        };
    },
    componentWillMount: function() {
        window.addEventListener("hashchange", this.onHashChange, false);
        this.setupRoutes();
    },
    setupRoutes: function() {
        Beef.Router().routes({
            '/': function() {
                return (<Homepage />);
            }
        });
    },
    render: function() {
        var url = this.state.url.length > 0 ? this.state.url.substr(1) : '/';
        return Beef.Router().route(url);
    },
    
    onHashChange: function() {
        this.setState({
            url: window.location.hash
        });
    }
});