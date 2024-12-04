import prisma from '../../src/configs/database.js';
import user from './user.seed.js';
import country from './country.seed.js';
import city from './city.seed.js';
import airport from './airport.seed.js';
import terminal from './terminal.seed.js';
import airline from './airline.seed.js';

async function main() {
    try {
        await user(prisma);
        await country(prisma);
        await city(prisma);
        await airport(prisma);
        await terminal(prisma);
        await airline(prisma);
    } catch (error) {
        console.log(error.message);
    }
}

main()
    .catch(e => {
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
