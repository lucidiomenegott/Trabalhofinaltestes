export class InvalidTaskNameError extends Error {
    constructor(message?: string) {
        super(message ?? 'O nome da tarefa não pode começar com um número.');
        this.name = 'InvalidTaskNameError';
    }
}