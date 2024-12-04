import * as TerminalController from '../../../controllers/terminal.controller.js';

export default (router) => {
    const prefix = '/terminals';

    router.get(prefix + '/', TerminalController.getTerminals);
    router.get(prefix + '/:id', TerminalController.getTerminal);
    router.post(prefix + '/', TerminalController.storeTerminal);
    router.put(prefix + '/:id', TerminalController.updateTerminal);
    router.delete(prefix + '/:id', TerminalController.destroyTerminal);
};