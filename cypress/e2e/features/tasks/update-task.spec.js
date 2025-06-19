describe('Edição de Tarefa', () => {
  it('deve editar o título de uma tarefa existente', () => {
    cy.visit('/tasks');

    cy.get('.task-list').contains('Tarefa de Teste').click();

    cy.get('input[name="title"]').clear().type('Tarefa Atualizada');
    cy.get('button[type="submit"]').click();

    cy.get('.task-list').should('contain', 'Tarefa Atualizada');
    cy.get('.task-list').should('not.contain', 'Tarefa de Teste');
  });
});
