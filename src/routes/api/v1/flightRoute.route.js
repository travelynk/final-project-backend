import * as flightRouteController from '../../../controllers/flightRoute.controller.js';

export default (router) => {
    const prefix = '/flights/routes';

    router.get(prefix + '/', flightRouteController.getFlightRoutes);
    router.get(prefix + '/:id', flightRouteController.getFlightRoute);
    router.post(prefix + '/', flightRouteController.storeFlightRoute);
    router.put(prefix + '/:id', flightRouteController.updateFlightRoute);
    router.delete(prefix + '/:id', flightRouteController.destroyFlightRoute);
};