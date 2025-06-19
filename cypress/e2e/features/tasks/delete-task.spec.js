describe('Exclusão de Tarefa', () => {
  it('deve excluir uma tarefa existente', () => {
    cy.visit('/tasks');

    cy.get('.task-list').contains('Tarefa Atualizada').parent().find('.delete-button').click();

    cy.get('.confirm-delete').click();

    cy.get('.task-list').should('not.contain', 'Tarefa Atualizada');
  });
});
