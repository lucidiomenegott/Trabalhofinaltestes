export class TaskCompletedError extends Error {
    constructor(message?: string) {
        super(message ?? 'A tarefa não pode ser excluída porque está concluída.');
        this.name = 'TaskCompletedError';
    }
}