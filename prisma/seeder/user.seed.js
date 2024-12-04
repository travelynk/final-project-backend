import excel from 'xlsx';
const { readFile, utils } = excel;

export default async function user(prisma) {
    // Membaca data dari file Excel
    const workbook = readFile('./prisma/seeder/data.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Mengonversi data Excel ke format JSON
    const data = utils.sheet_to_json(sheet);

    // Menambahkan data ke database menggunakan Prisma
    for (const item of data) {
        // console.log(`Menambahkan data ${item.email} ke database...`);
        try {
            await prisma.user.create({
                data: {
                    email: item.email,
                    password: item.password,
                    role: item.role,
                    otpSecret: item.otpSecret,
                    verified: item.verified,
                    createdAt: new Date(item.createdAt),
                    updatedAt: new Date(item.updatedAt),
                    profile: {
                        create: {
                            fullName: item.fullName,
                            phone: item.phone,
                            gender: item.gender
                        }
                    }
                },
            });
        } catch (error) {
            console.log(`Gagal menambahkan data ${item.email} ke database! - ${error.message}`);
        }
    }

    console.log(`Data ${sheetName} telah berhasil di-seed ke database!\n`);
};