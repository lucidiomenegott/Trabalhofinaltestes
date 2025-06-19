Feature: Edição de tarefas
  Como um usuário autenticado
  Quero editar uma tarefa existente
  Para atualizar informações ou corrigir erros

  Background:
    Given que o usuário "John" está cadastrado com o e-mail "john@user.example" e a senha "123456"
    And está autenticado com o e-mail "john@user.example" e a senha "123456"
    And acessa a página de listagem de tarefas
    And a tarefa "Entregar trabalho final de QTSW" está na lista de tarefas

  Scenario: Edição bem-sucedida de uma tarefa
    When clica na tarefa "Entregar trabalho final de QTSW"
    And preenche o título com "Entregar trabalho final de QTSW - Atualizado"
    And envia o formulário de edição
    Then a tarefa "Entregar trabalho final de QTSW - Atualizado" deve aparecer na lista de tarefas
