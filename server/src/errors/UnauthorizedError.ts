export class UnauthorizedError extends Error {
    constructor(message?: string) {
        super(message ?? 'Usuário não autorizado a excluir essa tarefa');
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, UnauthorizedError.prototype); // Corrige a cadeia de protótipos
    }
}
