import * as terminalService from '../services/terminal.service.js';
import * as response from '../utils/response.js';
import * as TerminalValidation from '../validations/terminal.validation.js';

export const getTerminals = async (req, res) => {
    try {
        const terminals = await terminalService.getAll();
        response.res200('Berhasil mengambil semua data terminal', terminals, res);
    } catch (error) {
        console.log(error.message);
        response.res500(res);
    }
};

export const getTerminal = async (req, res) => {
    try {
        const terminal = await terminalService.getOne(req.params.id);
        if (!terminal) {
            response.res404('Data terminal tidak ditemukan', res);
            return;
        }
        response.res200('Berhasil mengambil data terminal', terminal, res);
    } catch (error) {
        console.log(error.message);
        response.res500(res);
    }
};

export const storeTerminal = async (req, res) => {
    try {
        const { error, value } = TerminalValidation.payload.validate(req.body);
        if (error) {
            return response.res400(`Validasi error: ${error.details[0].message}`, res);
        }
        const terminal = await terminalService.store(value);
        response.res201('Berhasil menambahkan data terminal', terminal, res);
    } catch (error) {
        console.log(error.message);
        response.res500(res);
    }
};

export const updateTerminal = async (req, res) => {
    try {
        const { error, value } = TerminalValidation.payload.validate(req.body);
        if (error) {
            return response.res400(`Validasi error: ${error.details[0].message}`, res);
        }

        const terminal = await terminalService.update(req.params.id, value);
        response.res200('Berhasil mengubah data terminal', terminal, res);
    } catch (error) {
        console.log(error.message);
        response.res500(res);
    }
};

export const destroyTerminal = async (req, res) => {
    try {
        const terminal = await terminalService.destroy(req.params.id);
        response.res200('Berhasil menghapus data terminal', terminal, res);
    } catch (error) {
        console.log(error.message);
        response.res500(res);
    }
};