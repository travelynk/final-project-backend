import * as terminalController from '../../../controllers/terminal.controller.js';

export default (router) => {
    const prefix = '/terminals';

    router.get(prefix + '/', terminalController.getTerminals);
    router.get(prefix + '/:id', terminalController.getTerminal);
    router.post(prefix + '/', terminalController.storeTerminal);
    router.put(prefix + '/:id', terminalController.updateTerminal);
    router.delete(prefix + '/:id', terminalController.destroyTerminal);
};