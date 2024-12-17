import * as TerminalController from '../../../controllers/terminal.controller.js';
import { isAdmin } from '../../../middlewares/auth.js';

export default (router) => {
    const prefix = '/terminals';

    router.get(prefix + '/', TerminalController.getTerminals);
    router.get(prefix + '/:id', TerminalController.getTerminal);
    router.post(prefix + '/', isAdmin, TerminalController.storeTerminal);
    router.put(prefix + '/:id', isAdmin, TerminalController.updateTerminal);
    router.delete(prefix + '/:id', isAdmin, TerminalController.destroyTerminal);
};