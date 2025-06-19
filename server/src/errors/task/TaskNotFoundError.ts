export class TaskNotFoundError extends Error {
    constructor(message?: string) {
        super(message ?? 'Tarefa não encontrada');
        this.name = this.constructor.name; // Garantir que o nome da classe seja o correto
        Object.setPrototypeOf(this, TaskNotFoundError.prototype); // Para garantir que a cadeia de protótipos seja correta
    }
}

export class TaskCompletedError extends Error {
    constructor(message?: string) {
        super(message ?? 'A tarefa não pode ser excluída porque está concluída.');
        this.name = 'TaskCompletedError';
    }
}