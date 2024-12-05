const generateSeatCodes = (totalSeats, columnsPerRow) => {
    const rows = Math.ceil(totalSeats / columnsPerRow); // Hitung total baris
    const columnLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, columnsPerRow); // Kolom (misal: A-F)
    const seatCodes = [];

    for (let row = 1; row <= rows; row++) {
        for (let col of columnLetters) {
            seatCodes.push(`${row}${col}`); // Gabungkan baris dan kolom (misal: 1A, 1B)
        }
    }

    return seatCodes.slice(0, totalSeats); // Batasi hingga kapasitas kursi
};

export default generateSeatCodes;