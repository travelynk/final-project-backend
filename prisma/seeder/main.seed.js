import prisma from '../../src/configs/database.js';
import user from './user.seed.js';
import country from './country.seed.js';
import city from './city.seed.js';
import airport from './airport.seed.js';
import terminal from './terminal.seed.js';

async function main() {
    try {
        user(prisma);
        country(prisma);
        city(prisma);
        airport(prisma);
        terminal(prisma);
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
