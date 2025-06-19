/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock do middleware de autenticação para simular a autenticação durante o teste
jest.mock('../../middlewares/auth.middleware', () => ({
    authenticate: (req: any, res: any, next: any) => {
        req.userId = testUser.id ?? 1;
        next();
    },
}));

import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import app from '../../app';
import { prisma } from '../../utils/prisma';
import { setupTestDB, disconnectTestDB, testUser } from '../setup.test.db';

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await disconnectTestDB();
});

describe('TaskController', () => {
    describe('POST /api/tasks', () => {
        it('deve criar tarefa com dados válidos', async () => {
            // Arrange (preparar)
            const taskData = {
                title: `Tarefa válida ${new Date()}`,
                description: 'Essa é uma tarefa válida',
                completed: false,
                priority: 'low',
            };

            // Act (agir)
            const response = await request(app).post('/api/tasks').send(taskData);

            // Assert (verificar)
            expect(response.statusCode).toBe(StatusCodes.CREATED);
            expect(response.body).toEqual({
                ...taskData,
                id: expect.any(Number),
                userId: 1,
                dueDate: null,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            });

            const taskInDB = await prisma.task.findFirst({ where: { title: taskData.title } });
            expect(taskInDB).toEqual(
                expect.objectContaining({
                    ...taskData,
                    id: expect.any(Number),
                    userId: 1,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date),
                }),
            );
        });
    });
});

describe('POST /api/tasks', () => {
    it('deve retornar erro ao tentar criar tarefa sem título', async () => {
        // Arrange (preparar)
        const taskData = {
            description: 'Essa é uma tarefa válida sem título',
            completed: false,
            priority: 'low',
        };

        // Act (agir)
        const response = await request(app).post('/api/tasks').send(taskData);

        // Assert (verificar)
        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST); // Espera erro de validação
        expect(response.body).toEqual(
            expect.objectContaining({
                message: 'Título é obrigatório', // Ou a mensagem específica de erro que sua API retorna
            })
        );
    });
});

describe('POST /api/tasks', () => {
    it('deve retornar erro ao tentar criar tarefa com prioridade inválida', async () => {
        // Arrange (preparar)
        const taskData = {
            title: `Tarefa inválida ${new Date()}`,
            description: 'Essa tarefa tem prioridade inválida',
            completed: false,
            priority: 'alta', // Valor inválido, pois o sistema espera um valor como 'low', 'medium', 'high'
        };

        // Act (agir)
        const response = await request(app).post('/api/tasks').send(taskData);

        // Assert (verificar)
        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST); // Espera erro de validação
        expect(response.body).toEqual(
            expect.objectContaining({
                message: 'Prioridade inválida', // Ou a mensagem específica de erro que sua API retorna
            })
        );
    });
});
