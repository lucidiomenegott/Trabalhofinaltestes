Feature: Login de usuário
  Como um usuário não autenticado
  Quero realizar o login
  Para acessar o painel de tarefas

  Scenario: Login bem-sucedido com credenciais válidas
    Given que o usuário "teste@exemplo.com" está registrado com a senha "senha123"
    When preenche o campo "email" com "teste@exemplo.com"
    And preenche o campo "senha" com "senha123"
    And envia o formulário de login
    Then o usuário deve ser redirecionado para o painel de tarefas
