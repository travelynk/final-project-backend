import qr from 'node-qr-image';

const generateQrPng = async (url) => {
        const qrCode = qr.imageSync(url, { type: 'png', parse_url: true, size: 10 });
        return qrCode;
};

export { generateQrPng };
