import { TaskCompletedError } from '../errors/TaskCompletedError'; // Importando o erro de tarefa concluída
import { TaskNotFoundError } from '../errors/task/TaskNotFoundError';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { prisma } from '../utils/prisma';
import { InvalidTaskNameError } from '../errors/task/InvalidTaskNameError';  // Adicionando a importação do erro

export class TaskService {
    // Método para criar uma tarefa
    static async createTask(
        userId: number,
        data: {
            title: string;
            description?: string;
            dueDate?: string | null;
            priority?: string;
        },
    ) {
        if (/^\d/.test(data.title)) {
            throw new InvalidTaskNameError();  // Lança erro se o título começar com número
        }

        const task = await prisma.task.create({
            data: {
                title: data.title,
                description: data.description,
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                priority: data.priority,
                userId,
            },
        });

        return task;
    }

    // Método para obter as tarefas de um usuário com filtros
    static async getTasks(userId: number, filters: { completed?: string; priority?: string }) {
        const { completed, priority } = filters;

        const tasks = await prisma.task.findMany({
            where: {
                userId,
                ...(completed !== undefined && { completed: completed === 'true' }),
                ...(priority && { priority }),
            },
            orderBy: { createdAt: 'desc' },
        });

        return tasks;
    }

    // Método para obter uma tarefa pelo seu ID
    static async getTaskById(userId: number, id: number) {
        const task = await prisma.task.findUnique({
            where: { id, userId },
        });

        if (!task) {
            throw new TaskNotFoundError();  // Lança erro se a tarefa não for encontrada
        }

        return task;
    }

    // Método para atualizar uma tarefa
    static async updateTask(
        userId: number,
        id: number,
        data: {
            title?: string;
            description?: string;
            completed?: boolean;
            dueDate?: string | null;
            priority?: string;
        },
    ) {
        // Verificar se a tarefa existe
        const task = await prisma.task.findUnique({
            where: { id, userId },
        });

        if (!task) {
            throw new TaskNotFoundError();  // Lança erro se a tarefa não for encontrada
        }

        const updatedTask = await prisma.task.update({
            where: { id, userId },
            data: {
                title: data.title,
                description: data.description,
                completed: data.completed,
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                priority: data.priority,
            },
        });

        return updatedTask;
    }

    // Método para excluir uma tarefa
    static async deleteTask(userId: number, id: number) {
        // Verificar se a tarefa existe
        const task = await prisma.task.findUnique({
            where: { id, userId },
        });

        if (!task) {
            throw new TaskNotFoundError();  // Lança o erro se a tarefa não for encontrada
        }

        // Verificar se a tarefa já está concluída
        if (task.completed) {
            throw new TaskCompletedError();  // Lança erro se a tarefa estiver concluída
        }

        // Verificar se a tarefa tem um estado inválido
        if (task.completed === null) {
            throw new Error('Tarefa com estado inválido');  // Lança erro de estado inválido
        }

        // Verificar se o usuário é o dono da tarefa
        if (task.userId !== userId) {
            throw new UnauthorizedError();  // Lança erro de autorização se o usuário não for o dono da tarefa
        }

        // Se a tarefa não estiver concluída e o usuário for o dono, exclui a tarefa
        await prisma.task.delete({
            where: { id, userId },
        });
    }
}
