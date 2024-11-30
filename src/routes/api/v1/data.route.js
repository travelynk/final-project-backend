// routes/updateProfile.route.js
import * as DataController from '../../../controllers/data.controller.js';

export default (router) => {
    const prefix = '/data';

    // Route untuk memperbarui data profile
    router.put(prefix + '/update', DataController.dataProfile);
};
