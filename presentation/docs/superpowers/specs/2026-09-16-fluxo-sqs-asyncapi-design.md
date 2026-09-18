# Fluxo SQS e simplificação da narrativa

## Objetivo

Tornar a sequência conceitual e prática mais fácil de apresentar, usando o mesmo exemplo em todos os slides. A narrativa deve distinguir significado de transporte e mostrar HTTP, SQS e EventBridge sem criar três histórias desconectadas.

## História única

O exemplo fictício usa três interações:

1. `CreateOrder`: Command síncrono enviado pelo cliente a Orders via API Gateway.
2. `ReserveInventory`: Command assíncrono enviado por Orders a Inventory via SQS.
3. `OrderCreated`: Event publicado por Orders no EventBridge e consumido por Notifications.

O fluxo técnico será:

`Cliente → API Gateway → Orders Lambda → DynamoDB`

`Orders Lambda → SQS inventory-commands → Inventory Lambda → API externa de estoque`

`Orders Lambda → EventBridge → Notifications Lambda → Amazon SES`

## Slides afetados

### Semântica não é transporte

Substituir a comparação abstrata por três exemplos concretos. O slide apresenta primeiro o significado e depois o mecanismo:

- Command `CreateOrder` → API Gateway.
- Command `ReserveInventory` → SQS.
- Event `OrderCreated` → EventBridge.

Os dois Commands em mecanismos diferentes demonstram que semântica não determina transporte. A revelação deve ser progressiva e terminar com essa conclusão, sem texto adicional no rodapé.

### Sistema de pedidos na AWS

Atualizar o mapa para representar os três fluxos. SQS fica entre Orders e Inventory; EventBridge encaminha `OrderCreated` para Notifications. Inventory mantém a API externa, e Notifications mantém o Amazon SES. Os cliques devem acompanhar HTTP, persistência, SQS e EventBridge nessa ordem.

### Interfaces de Orders

Manter as operações HTTP e adicionar as duas mensagens assíncronas:

- `ReserveInventory`, Command via SQS.
- `OrderCreated`, Event via EventBridge.

O slide deve mostrar duas categorias de interface — HTTP e mensagens — sem transformar cada mecanismo em uma nova categoria conceitual.

### Contrato AsyncAPI

Usar um recorte didático do AsyncAPI 3.0 focado em duas perguntas:

- Onde circula? `channel`, `address` e `x-protocol`.
- O que circula? `message`, `name`, schema e `x-kind`.

Mostrar dois exemplos no mesmo arquivo:

- Canal `inventoryCommands`, endereço `inventory-commands`, `x-protocol: sqs`, mensagem `ReserveInventory`, `x-kind: command`.
- Canal `orderEvents`, endereço `default`, `x-protocol: eventbridge`, mensagem `OrderCreated`, `x-kind: event`.

`x-protocol` e `x-kind` devem ser identificados como extensões do projeto. As operações `send` e `receive` permanecem válidas no contrato completo, mas não aparecem no recorte visual para não desviar a explicação. As notas registram que a direção é sempre descrita da perspectiva da aplicação.

### Pipeline e publicação

Remover a narrativa de auditoria em Python e a bifurcação de sucesso/falha. Manter um fluxo linear:

`Contratos nos repositórios → CodePipeline → geração do EventCatalog → dist/ → S3 → CloudFront → usuário`

Python pode continuar aparecendo discretamente como implementação do gerador, sem ser um conceito que precise ser explicado.

### Visão do EventCatalog

Substituir a árvore de decisão por um mapa de serviços equivalente ao diagrama AWS:

- Cliente chama `CreateOrder` em Orders.
- Orders envia `ReserveInventory` para Inventory.
- Orders publica `OrderCreated`, consumido por Notifications.

Esse slide mostra que o catálogo permite navegar pelas relações documentadas. O slide seguinte continua reservado aos detalhes e ao schema de um recurso.

## Notas de apresentação

As notas devem usar palavras-chave, não parágrafos. A sequência verbal recomendada é:

1. Classificar a intenção.
2. Escolher o mecanismo.
3. Registrar o contrato.
4. Gerar e publicar o catálogo.

## Validação

- Atualizar os testes de conteúdo antes dos componentes.
- Verificar os estados de clique dos slides alterados.
- Executar os testes da apresentação e o build do Slidev.
- Conferir visualmente textos cortados, setas, ícones e legibilidade em 16:9.
- Confirmar que os mesmos nomes aparecem no diagrama AWS, YAML e EventCatalog.
