export const res200 = (message, data, res) => {
    res.status(200).json({
        status: {
            code: 200,
            message,
        },
        data,
    });
}

export const res201 = (message, data, res) => {
    res.status(201).json({
        status: {
            code: 201,
            message,
        },
        data,
    });
}

export const res400 = (message, res) => {
    res.status(400).json({
        status: {
            code: 400,
            message,
        },
        data: null,
    });
}

export const res401 = (res) => {
    res.status(401).json({
        status: {
            code: 401,
            message: "Unauthorized Access!",
        },
        data: null,
    });
}

export const res404 = (message, res) => {
    res.status(404).json({
        status: {
            code: 404,
            message,
        },
        data: null,
    });
}

export const res500 = (res) => {
    res.status(500).json({
        status: {
            code: 500,
            message: "Server error!",
        },
        data: null,
    });
}