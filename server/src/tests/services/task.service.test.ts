import { InvalidTaskNameError } from '../../errors/task/InvalidTaskNameError';
import { TaskNotFoundError } from '../../errors/task/TaskNotFoundError';
import { TaskService } from '../../services/task.service';
import { prisma } from '../../utils/prisma';
import { UnauthorizedError } from '../../errors/UnauthorizedError';
import { TaskCompletedError } from '../../errors/TaskCompletedError';

jest.mock('../../utils/prisma', () => ({
    prisma: {
        task: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

describe('TaskService', () => {
    const userId = 1;
    const tarefasMock = [
        { id: 1, title: 'Tarefa 1', userId, completed: true, priority: 'high' },
        { id: 2, title: 'Tarefa 2', userId, completed: false, priority: 'high' },
        { id: 3, title: 'Tarefa 3', userId, completed: true, priority: 'medium' },
        { id: 4, title: 'Tarefa 4', userId, completed: true, priority: 'high' },
    ];

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createTask', () => {
        it('deve criar tarefa quando o título for válido', async () => {
            const dadosValidos = {
                title: 'Tarefa válida',
                description: 'Essa é uma tarefa com o título válido',
            };

            const tarefaCriadaMock = {
                id: 1,
                ...dadosValidos,
                dueDate: null,
                priority: null,
                userId,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.task.create as jest.Mock).mockResolvedValue(tarefaCriadaMock);

            const tarefa = await TaskService.createTask(userId, dadosValidos);

            expect(prisma.task.create).toHaveBeenCalledWith({
                data: {
                    ...dadosValidos,
                    dueDate: null,
                    priority: undefined,
                    userId,
                },
            });

            expect(tarefa).toEqual(tarefaCriadaMock);
        });

        it('deve lançar erro se o título da tarefa começar com número', async () => {
            const dadosInvalidos = {
                title: '1 Tarefa inválida',
                description: 'Essa é uma tarefa com o título inválido',
            };

            const promise = TaskService.createTask(userId, dadosInvalidos);

            await expect(promise).rejects.toBeInstanceOf(InvalidTaskNameError);
        });

        it('deve criar tarefa com todos os campos preenchidos', async () => {
            const dadosEntrada = {
                title: 'Nova tarefa',
                description: 'Descrição',
                dueDate: '2025-05-30',
                priority: 'medium',
            };

            const tarefaEsperada = {
                id: 1,
                ...dadosEntrada,
                dueDate: new Date(dadosEntrada.dueDate),
                userId,
            };

            (prisma.task.create as jest.Mock).mockResolvedValue(tarefaEsperada);

            const resultado = await TaskService.createTask(userId, dadosEntrada);

            expect(prisma.task.create).toHaveBeenCalledWith({
                data: {
                    ...dadosEntrada,
                    dueDate: new Date(dadosEntrada.dueDate),
                    userId,
                },
            });

            expect(resultado).toEqual(tarefaEsperada);
        });

        it('deve aceitar data de vencimento nula', async () => {
            const dadosEntrada = { title: 'Tarefa sem data de vencimento', dueDate: null };
            const tarefaEsperada = { id: 2, ...dadosEntrada, userId };

            (prisma.task.create as jest.Mock).mockResolvedValue(tarefaEsperada);

            const resultado = await TaskService.createTask(userId, dadosEntrada);

            expect(resultado.dueDate).toBeNull();
        });
    });

    describe('getTasks', () => {
        it('deve retornar tarefas filtradas por prioridade e status de conclusão', async () => {
            const filtros = { completed: 'true', priority: 'high' };
            const tarefasFiltradas = tarefasMock.filter(
                (tarefa) => tarefa.completed && tarefa.priority === 'high',
            );

            (prisma.task.findMany as jest.Mock).mockResolvedValue(tarefasFiltradas);

            const resultado = await TaskService.getTasks(userId, filtros);

            expect(prisma.task.findMany).toHaveBeenCalledWith({
                where: { userId, completed: true, priority: 'high' },
                orderBy: { createdAt: 'desc' },
            });

            expect(resultado).toEqual(tarefasFiltradas);
        });

        it('deve retornar todas as tarefas se não houver filtros', async () => {
            (prisma.task.findMany as jest.Mock).mockResolvedValue(tarefasMock);

            const resultado = await TaskService.getTasks(userId, {});

            expect(prisma.task.findMany).toHaveBeenCalledWith({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            });

            expect(resultado).toEqual(tarefasMock);
        });
    });

    describe('getTaskById', () => {
        it('deve retornar uma tarefa existente pelo seu identificador', async () => {
            (prisma.task.findUnique as jest.Mock).mockResolvedValue(tarefasMock[0]);

            const resultado = await TaskService.getTaskById(userId, tarefasMock[0].id);

            expect(resultado).toEqual(tarefasMock[0]);
        });

        it('deve lançar erro ao buscar tarefa pelo identificador se a tarefa não existir', async () => {
            (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

            const promise = TaskService.getTaskById(userId, 999);

            await expect(promise).rejects.toBeInstanceOf(TaskNotFoundError);
        });
    });

    describe('updateTask', () => {
        it('deve atualizar a tarefa com os dados fornecidos', async () => {
            const dadosAtualizacao = {
                title: 'Tarefa atualizada',
                completed: true,
                dueDate: '2025-06-01',
            };

            const tarefaAtualizada = {
                id: 1,
                ...dadosAtualizacao,
                dueDate: new Date(dadosAtualizacao.dueDate),
                userId,
            };

            (prisma.task.findUnique as jest.Mock).mockResolvedValue({ id: 1, userId });

            (prisma.task.update as jest.Mock).mockResolvedValue(tarefaAtualizada);

            const resultado = await TaskService.updateTask(userId, 1, dadosAtualizacao);

            expect(prisma.task.update).toHaveBeenCalledWith({
                where: { id: 1, userId },
                data: { ...dadosAtualizacao, dueDate: new Date(dadosAtualizacao.dueDate) },
            });

            expect(resultado).toEqual(tarefaAtualizada);
        });

        it('deve permitir atualização parcial da tarefa', async () => {
            const dadosAtualizacao = { title: 'Tarefa com o título atualizado' };
            const tarefaAtualizada = { id: 2, ...dadosAtualizacao, userId };

            (prisma.task.findUnique as jest.Mock).mockResolvedValue({ id: 2, userId });

            (prisma.task.update as jest.Mock).mockResolvedValue(tarefaAtualizada);

            const resultado = await TaskService.updateTask(userId, 2, dadosAtualizacao);

            expect(resultado).toEqual(tarefaAtualizada);
        });

        it('deve lançar erro quando tentar atualizar uma tarefa que não existe', async () => {
            const dadosAtualizacao = {
                title: 'Tarefa inexistente',
                completed: false,
                dueDate: '2025-07-01',
            };

            (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

            const promise = TaskService.updateTask(userId, 999, dadosAtualizacao);

            await expect(promise).rejects.toBeInstanceOf(TaskNotFoundError);
        });
    });

    describe('deleteTask', () => {
        it('deve excluir a tarefa pelo seu identificador', async () => {
            (prisma.task.findUnique as jest.Mock).mockResolvedValue({ id: 1, userId });
            (prisma.task.delete as jest.Mock).mockResolvedValue(undefined);

            await TaskService.deleteTask(userId, 1);

            expect(prisma.task.delete).toHaveBeenCalledWith({
                where: { id: 1, userId },
            });
        });

        it('deve lançar erro quando tentar excluir uma tarefa que não existe', async () => {
            (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

            const promise = TaskService.deleteTask(userId, 999);

            await expect(promise).rejects.toBeInstanceOf(TaskNotFoundError);
        });

        it('deve lançar erro quando o usuário tentar excluir uma tarefa que não lhe pertence', async () => {
            const userId = 1;
            const tarefaPertenceOutroUsuario = { id: 1, userId: 2 };

            (prisma.task.findUnique as jest.Mock).mockResolvedValue(tarefaPertenceOutroUsuario);

            const promise = TaskService.deleteTask(userId, 1);

            await expect(promise).rejects.toBeInstanceOf(UnauthorizedError);
        });

        it('deve lançar erro quando tentar excluir uma tarefa que já foi concluída', async () => {
            const userId = 1;
            const tarefaConcluida = { id: 1, userId, completed: true };

            (prisma.task.findUnique as jest.Mock).mockResolvedValue(tarefaConcluida);

            const promise = TaskService.deleteTask(userId, 1);

            await expect(promise).rejects.toBeInstanceOf(TaskCompletedError);
        });

            it('deve lançar erro quando a tarefa estiver em estado inválido', async () => {
        // Arrange (preparar)
        const tarefaEmEstadoInvalido = { id: 1, userId, completed: null }; // Tarefa sem estado de conclusão

        (prisma.task.findUnique as jest.Mock).mockResolvedValue(tarefaEmEstadoInvalido);  // Simulando tarefa inválida

        // Act (agir)
        const promise = TaskService.deleteTask(userId, 1);  // Tentando excluir tarefa inválida

        // Assert (verificar)
        await expect(promise).rejects.toThrowError('Tarefa com estado inválido'); // Esperando erro de estado inválido
    });

    it('deve lançar erro quando o usuário tentar excluir uma tarefa sem permissão', async () => {
        // Arrange (preparar)
        const userId = 1;
        const tarefaSemPermissao = { id: 2, userId: 3 };  // A tarefa não pertence ao usuário

        (prisma.task.findUnique as jest.Mock).mockResolvedValue(tarefaSemPermissao);  // Simulando que a tarefa não pertence ao usuário

        // Act (agir)
        const promise = TaskService.deleteTask(userId, 2);  // Tentando excluir tarefa que não pertence ao usuário

        // Assert (verificar)
        await expect(promise).rejects.toBeInstanceOf(UnauthorizedError);  // Esperando erro de autorização
    });

    it('deve lançar erro quando a tarefa já estiver excluída', async () => {
        // Arrange (preparar)
        (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);  // Simulando que a tarefa foi excluída

        // Act (agir)
        const promise = TaskService.deleteTask(userId, 999);  // Tentando excluir uma tarefa inexistente

        // Assert (verificar)
        await expect(promise).rejects.toBeInstanceOf(TaskNotFoundError);  // Esperando erro de tarefa não encontrada
    });

    it('deve retornar confirmação de sucesso após exclusão', async () => {
        // Arrange (preparar)
        (prisma.task.findUnique as jest.Mock).mockResolvedValue({ id: 1, userId });  // Simula que a tarefa existe
        (prisma.task.delete as jest.Mock).mockResolvedValue(undefined);  // Simula a exclusão com sucesso

        // Act (agir)
        const resultado = await TaskService.deleteTask(userId, 1);  // Tentando excluir a tarefa com id 1

        // Assert (verificar)
        expect(prisma.task.delete).toHaveBeenCalledWith({
            where: { id: 1, userId },
        });
        expect(resultado).toBeUndefined(); // Esperando que o retorno seja undefined, pois a exclusão foi bem-sucedida
    });

    it('deve permitir excluir tarefa não concluída', async () => {
        // Arrange (preparar)
        const tarefaNaoConcluida = { id: 1, userId, completed: false };  // Tarefa não concluída

        (prisma.task.findUnique as jest.Mock).mockResolvedValue(tarefaNaoConcluida);  // Simulando tarefa não concluída

        // Act (agir)
        const promise = TaskService.deleteTask(userId, 1);  // Tentando excluir tarefa não concluída

        // Assert (verificar)
        await expect(promise).resolves.not.toThrow();  // Esperando que a exclusão aconteça sem erros
    });

    it('deve excluir tarefa com sucesso mesmo com status "pendente"', async () => {
        // Arrange (preparar)
        const tarefaPendente = { id: 1, userId, completed: false };  // Tarefa com status "pendente"

        (prisma.task.findUnique as jest.Mock).mockResolvedValue(tarefaPendente);  // Simulando tarefa com status pendente

        // Act (agir)
        const resultado = await TaskService.deleteTask(userId, 1);  // Tentando excluir tarefa pendente

        // Assert (verificar)
        expect(prisma.task.delete).toHaveBeenCalledWith({
            where: { id: 1, userId },
        });
        expect(resultado).toBeUndefined(); // Esperando que a exclusão aconteça sem erro
    });



    
    });
});
