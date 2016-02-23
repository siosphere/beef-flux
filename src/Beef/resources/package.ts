/// <reference path="../../../lib/jquery.d.ts" />
/// <reference path="../Beef.ts" />
/// <reference path="../Component/BaseApp.ts" />
/// <reference path="../Component/BaseService.ts" />
/// <reference path="../Component/Store.ts" />
/// <reference path="../Component/Dispatcher/Callback.ts" />
/// <reference path="../Component/Dispatcher/Payload.ts" />
/// <reference path="../Component/Routing/Config.ts" />
/// <reference path="../Service/ApiService.ts" />
/// <reference path="../Service/Dispatcher.ts" />
/// <reference path="../Service/RoutingService.ts" />
/**
 * Register our services
 */
Beef.setup(function() {
    Beef.service(ApiService.SERVICE_ID, new ApiService());
    Beef.service(Dispatcher.SERVICE_ID, new Dispatcher());
    Beef.service(RoutingService.SERVICE_ID, new RoutingService());
});