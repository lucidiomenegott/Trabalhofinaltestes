describe('Criação de Tarefa', () => {
  it('deve criar uma nova tarefa com sucesso', () => {
    cy.visit('/tasks/create');

    cy.get('input[name="title"]').type('Tarefa de Teste');
    cy.get('textarea[name="description"]').type('Descrição da tarefa de teste');
    cy.get('button[type="submit"]').click();

    cy.get('.task-list').should('contain', 'Tarefa de Teste');
  });
});
