import excel from 'xlsx';
const { readFile, utils } = excel;

export default async function voucher(prisma) {
    // Membaca data dari file Excel
    const workbook = readFile('./prisma/seeder/data.xlsx');
    const sheetName = workbook.SheetNames[7];
    const sheet = workbook.Sheets[sheetName];

    // Mengonversi data Excel ke format JSON
    const data = utils.sheet_to_json(sheet);

    // Menambahkan data ke database menggunakan Prisma
    for (const item of data) {
        // console.log(`Menambahkan data ${item.code}-${item.name}-${item.cityCode} ke database...`);
        try {
            await prisma.voucher.create({
                data: {
                    code: item.code,
                    type: item.type,
                    value: item.value,
                    minPurchase: item.minPurchase,
                    maxVoucher: item.maxVoucher,
                    startDate: new Date(item.startDate),
                    endDate: new Date(item.endDate),
                    createdAt: new Date(item.createdAt),
                    updatedAt: new Date(item.updatedAt),
                },
            });
        } catch (error) {
            console.log(`Gagal menambahkan data ${item.code} ke database! - ${error.message}`);
        }
    }

    console.log(`Data ${sheetName} telah berhasil di-seed ke database!\n`);
};