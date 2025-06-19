Feature: Listagem de tarefas
  Como um usuário autenticado
  Quero visualizar as tarefas criadas
  Para acompanhar o progresso das minhas atividades

  Background:
    Given que o usuário "John" está cadastrado com o e-mail "john@user.example" e a senha "123456"
    And está autenticado com o e-mail "john@user.example" e a senha "123456"
    And acessa a página de listagem de tarefas

  Scenario: Visualização de tarefas na lista
    When visualiza a lista de tarefas
    Then a lista de tarefas deve estar visível
    And deve exibir ao menos uma tarefa na lista
