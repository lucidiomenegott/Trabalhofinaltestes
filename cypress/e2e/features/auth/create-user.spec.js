describe('Criação de Usuário', () => {
  it('deve criar um novo usuário com sucesso', () => {
    // Visitar a página de criação de usuário
    cy.visit('/auth/create');

    // Preencher o formulário de criação de usuário
    cy.get('input[name="email"]').type('teste@exemplo.com');
    cy.get('input[name="password"]').type('senha123');
    cy.get('input[name="name"]').type('Usuário Teste');
    cy.get('button[type="submit"]').click();

    // Verificar se o usuário foi criado com sucesso
    cy.get('.user-list').should('contain', 'Usuário Teste');
  });
});
