describe('Listagem de Tarefas', () => {
  it('deve exibir as tarefas na lista', () => {
    cy.visit('/tasks');

    cy.get('.task-list').should('be.visible');
    cy.get('.task-list').children().should('have.length.greaterThan', 0);
  });
});
