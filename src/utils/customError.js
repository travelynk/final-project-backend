export class Error400 extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.status = false;
        this.statusCode = statusCode;
        this.name = 'BadRequest';
    }
}

export class Error401 extends Error {
    constructor(message, statusCode = 401) {
        super(message);
        this.status = false;
        this.statusCode = statusCode;
        this.name = 'Unauthorized';
    }
}
// Uncomment when needed
// export class Error403 extends Error {
//     constructor(message, statusCode = 403) {
//         super(message);
//         this.status = false;
//         this.statusCode = statusCode;
//         this.name = 'Forbidden';
//     }
// }

export class Error404 extends Error {
    constructor(message, statusCode = 404) {
        super(message);
        this.status = false;
        this.statusCode = statusCode;
        this.name = 'NotFound';
    }
}

export class Error409 extends Error {
    constructor(message, statusCode = 409) {
        super(message);
        this.status = false;
        this.statusCode = statusCode;
        this.name = 'Conflict';
    }
}

// Uncomment when needed
// export class Error500 extends Error {
//     constructor(message, statusCode = 500) {
//         super(message);
//         this.status = false;
//         this.statusCode = statusCode;
//         this.name = 'InternalServerError';
//     }
// }

// export class Error502 extends Error {
//     constructor(message, statusCode = 502) {
//         super(message);
//         this.status = false;
//         this.statusCode = statusCode;
//         this.name = 'BadGateway';
//     }
// }

// export class Error503 extends Error {
//     constructor(message, statusCode = 503) {
//         super(message);
//         this.status = false;
//         this.statusCode = statusCode;
//         this.name = 'ServiceUnavailable';
//     }
// }
