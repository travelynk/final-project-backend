import * as TerminalService from '../services/terminal.service.js';
import * as TerminalValidation from '../validations/terminal.validation.js';
import { res200, res201 } from '../utils/response.js';
import { Error400, Error404 } from '../utils/customError.js';

export const getTerminals = async (req, res, next) => {
    try {
        const terminals = await TerminalService.getAll();
        
        res200('Berhasil mengambil semua data terminal', terminals, res);
    } catch (error) {
        next(error);
    }
};

export const getTerminal = async (req, res, next) => {
    try {
        const terminal = await TerminalService.getOne(req.params.id);
        if (!terminal) throw new Error404('Data terminal tidak ditemukan');

        res200('Berhasil mengambil data terminal', terminal, res);
    } catch (error) {
        next(error);
    }
};

export const storeTerminal = async (req, res, next) => {
    try {
        const { error, value } = TerminalValidation.payload.validate(req.body);
        if (error) throw new Error400(`${error.details[0].message}`);

        const terminal = await TerminalService.store(value);
        res201('Berhasil menambahkan data terminal', terminal, res);
    } catch (error) {
        next(error);
    }
};

export const updateTerminal = async (req, res, next) => {
    try {
        const { error, value } = TerminalValidation.payload.validate(req.body);
        if (error) throw new Error400(`${error.details[0].message}`);

        const terminal = await TerminalService.update(req.params.id, value);
        res200('Berhasil mengubah data terminal', terminal, res);
    } catch (error) {
        next(error);
    }
};

export const destroyTerminal = async (req, res, next) => {
    try {
        const terminal = await TerminalService.destroy(req.params.id);
        res200('Berhasil menghapus data terminal', terminal, res);
    } catch (error) {
        next(error);
    }
};