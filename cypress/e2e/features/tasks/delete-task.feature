Feature: Exclusão de tarefas
  Como um usuário autenticado
  Quero excluir tarefas que não são mais necessárias
  Para manter minha lista de tarefas organizada

  Background:
    Given que o usuário "John" está cadastrado com o e-mail "john@user.example" e a senha "123456"
    And está autenticado com o e-mail "john@user.example" e a senha "123456"
    And acessa a página de listagem de tarefas
    And a tarefa "Entregar trabalho final de QTSW - Atualizado" está na lista de tarefas

  Scenario: Exclusão bem-sucedida de uma tarefa
    When clica na tarefa "Entregar trabalho final de QTSW - Atualizado"
    And clica no botão de exclusão
    And confirma a exclusão
    Then a tarefa "Entregar trabalho final de QTSW - Atualizado" não deve mais aparecer na lista de tarefas
