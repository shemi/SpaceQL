
class Router {

    constructor(service) {
        this.service = service;
    }

    register(routes) {
        for(let route of routes) {
            for(let action of Object.keys(route.actions)) {
                this.registerRoute(route.controller, action, route['actions'][action]);
            }
        }
    }

    registerRoute(controller, action, callback) {
        this.service.on(`${controller}@${action}`, callback);
    }

}

export default Router;