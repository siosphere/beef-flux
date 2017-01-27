/**
 * Holds routes (an object with 'url/pattern': function())
 */
class RoutingConfig {
    constructor(routes) {
        this.routes = routes;
    }
    isRoute(url) {
        return typeof this.routes[url] !== 'undefined';
    }
    callRoute(url, data) {
        return this.routes[url](data);
    }
    handleRequest(url, request, response, data) {
        return this.routes[url](request, response, data);
    }
}
export { RoutingConfig };
