import excel from 'xlsx';
const { readFile, utils } = excel;

export default async function city(prisma) {
    // Membaca data dari file Excel
    const workbook = readFile('./prisma/seeder/data.xlsx');
    const sheetName = workbook.SheetNames[2];
    const sheet = workbook.Sheets[sheetName];

    // Mengonversi data Excel ke format JSON
    const data = utils.sheet_to_json(sheet);

    // Menambahkan data ke database menggunakan Prisma
    for (const item of data) {
        // console.log(`Menambahkan data ${item.code} ${item.name} ${item.countryCode} ke database...`);
        try {
            await prisma.city.create({
                data: {
                    code: item.code,
                    name: item.name,
                    countryCode: item.countryCode,
                },
            });
        } catch (error) {
            console.log(`Gagal menambahkan data ${item.name} ke database! - ${error.message}`);
        }
    }

    console.log(`Data ${sheetName} telah berhasil di-seed ke database!\n`);
};