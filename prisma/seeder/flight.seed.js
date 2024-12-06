import excel from 'xlsx';
import generateSeatCodes from '../../src/utils/generateSeatCode.js';
const { readFile, utils } = excel;

export default async function flight(prisma) {
    // Membaca data dari file Excel
    const workbook = readFile('./prisma/seeder/data.xlsx');
    const sheetName = workbook.SheetNames[6];
    const sheet = workbook.Sheets[sheetName];

    // Mengonversi data Excel ke format JSON
    const data = utils.sheet_to_json(sheet);

    // Menambahkan data ke database menggunakan Prisma
    for (const item of data) {
        // console.log(`Menambahkan data ${item.code}-${item.name}-${item.cityCode} ke database...`);
        try {
            const seats = generateSeatCodes(item.seatCapacity, 6);

            await prisma.flight.create({
                data: {
                    airlineId: item.airlineId,
                    flightNum: item.flightNum,
                    departureTerminalId: item.departureTerminalId,
                    arrivalTerminalId: item.arrivalTerminalId,
                    departureTime: new Date(item.departureTime),
                    arrivalTime: new Date(item.arrivalTime),
                    estimatedDuration: item.estimatedDuration,
                    seatClass: item.seatClass,
                    seatCapacity: item.seatCapacity,
                    facility: item.facility,
                    price: item.price,
                    flightSeats: {
                        createMany: {
                            data: seats.map(seat => ({ position: seat }))
                        }
                    }
                },
            });
        } catch (error) {
            console.log(`Gagal menambahkan data ${item.flightNum} ke database! - ${error.message}`);
        }
    }

    console.log(`Data ${sheetName} telah berhasil di-seed ke database!\n`);
};