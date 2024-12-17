import { DataSource } from 'typeorm';
import { User } from './users/user.entity';
import { Document } from './documents/documents.entity';
import { faker } from '@faker-js/faker';

const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres', 
    password: '1128',
    database: 'localDb',
    synchronize: true,
    logging: true,
    entities: [User , Document],
});

async function seedDatabase() {
    await AppDataSource.initialize();

    const userRepository = AppDataSource.getRepository(User);
    const documentRepository = AppDataSource.getRepository(Document);

    const roles = ['admin', 'editor', 'viewer'];
    const users: User[] = [];

    for (let i = 0; i < 1000; i++) {
        const user = userRepository.create({
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: roles[Math.floor(Math.random() * roles.length)],
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        users.push(user);
    }

    await userRepository.save(users);
    console.log('1000 users have been created.');

    const documents: Document[] = [];
    for (let i = 0; i < 1000; i++) {
        const document = documentRepository.create({
            name: faker.commerce.productName(),
            type: faker.system.fileType(),
            status: 'Pending',
            createdAt: new Date(),
            updatedAt: new Date(),
            filePath: faker.system.filePath(),
        });
        documents.push(document);
    }

    await documentRepository.save(documents);
    console.log('1000 documents have been created.');

    await AppDataSource.destroy();
}

seedDatabase().catch(err => {
    console.error('Error seeding database:', err);
});