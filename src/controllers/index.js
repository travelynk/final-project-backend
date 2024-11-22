import * as response from '../utils/response.js'

export const index = (req, res) => {
    response.res200('TraveLynk API v1 Ready to use (❁´◡`❁) Happy Coding guys!', null, res);
};