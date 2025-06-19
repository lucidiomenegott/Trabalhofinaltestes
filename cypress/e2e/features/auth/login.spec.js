describe('Login', () => {
  it('deve realizar login com sucesso', () => {
    // Visitar a página de login
    cy.visit('/auth/login');

    // Preencher o formulário de login
    cy.get('input[name="email"]').type('teste@exemplo.com');
    cy.get('input[name="password"]').type('senha123');
    cy.get('button[type="submit"]').click();

    // Verificar se o login foi bem-sucedido
    cy.url().should('include', '/dashboard');
  });
});
