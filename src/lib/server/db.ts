import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const db = new PrismaClient();
export default db;


async function main() {
    // ... you will write your Prisma Client queries here
}

main()
    .then(async () => {
        await db.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await db.$disconnect()
        process.exit(1)
    })