Feature: Criação de usuário
  Como um usuário não autenticado
  Desejo criar um novo usuário
  Para acessar o sistema com minhas credenciais

  Scenario: Criação bem-sucedida de um novo usuário
    Given que o usuário "teste@exemplo.com" não está registrado
    When preenche o campo "email" com "teste@exemplo.com"
    And preenche o campo "senha" com "senha123"
    And preenche o campo "nome" com "Usuário Teste"
    And envia o formulário de criação
    Then o usuário "Usuário Teste" deve ser criado com o e-mail "teste@exemplo.com"
