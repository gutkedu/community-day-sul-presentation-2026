# Infraestrutura e deploy

Uma única stack SAM cria dois buckets S3 privados, duas distribuições CloudFront, seus OACs e funções de roteamento. Uma política de cache é compartilhada. Não há stack aninhada, backend, domínio próprio ou certificado ACM personalizado.

## Pré-requisitos

- Bash (macOS/Linux), Node.js >=22.18, npm e AWS CLI v2.
- SAM CLI para `deploy-infra.sh` e `deploy-all.sh`; template validado com SAM 1.161.0.
- Credenciais AWS configuradas pela cadeia padrão da CLI: perfil, SSO, variáveis ou role. Use `aws sso login --profile NOME` quando aplicável.
- Região obrigatória por `--region`. `--profile` é opcional; o perfil padrão/`AWS_PROFILE` é usado quando omitido.

Os scripts resolvem caminhos a partir do próprio arquivo e funcionam fora da raiz. Instalam dependências com `npm ci --include=dev` para incluir as ferramentas de teste/build mesmo com `NODE_ENV=production`, e executam os testes antes de publicar. Não exportam PDFs; o download do Chromium é dispensado nessa instalação de deploy. Cada diretório mantém suas próprias dependências.

## Comandos

Execute a partir da raiz (troque `us-east-1` pela região desejada):

```bash
# Primeira publicação: verifica os dois projetos, cria a stack e publica ambos.
./infra/scripts/deploy-all.sh --region us-east-1

# Somente infraestrutura: também atende alterações futuras no template.
./infra/scripts/deploy-infra.sh --region us-east-1

# Conteúdo de uma stack já existente.
./infra/scripts/deploy-presentation.sh --region us-east-1
./infra/scripts/deploy-event-catalog.sh --region us-east-1
```

Todos aceitam `--profile PERFIL`, `--stack-name NOME` e `--help`. A stack padrão é `community-day-sul-presentation-2026`. Nomes devem começar com letra e ter até 40 letras, números ou hífens, deixando espaço para os sufixos obrigatórios dos recursos CloudFront. Não há `samconfig.toml` obrigatório nem credenciais no repositório.

`deploy-infra.sh` e `deploy-all.sh` exibem o change set via `sam deploy --confirm-changeset`. Revise substituições, exclusões e políticas antes de confirmar. Change sets vazios são sucesso. Antes de qualquer upload, o script compara o template original armazenado no CloudFormation com o local: isso bloqueia publicações após uma confirmação cancelada ou com infraestrutura desatualizada.

## Fluxo e isolamento

1. Instalar e testar as ferramentas de infraestrutura.
2. Instalar, testar e construir cada frontend selecionado. No catálogo, gerar os recursos a partir dos contratos e executar lint.
3. Validar todas as páginas e arquivos do build contra a função CloudFront correspondente.
4. Verificar a identidade AWS; em `infra/all`, validar e implantar o template uma única vez.
5. Ler os outputs e conferir a stack estável e o template implantado.
6. Publicar bundles com hash, depois arquivos mutáveis e finalmente HTMLs, preservando os caminhos de `dist/`.
7. Invalidar `/*` apenas na distribuição publicada, aguardar a conclusão e imprimir a URL.

Os scripts individuais não alteram a infraestrutura nem o outro site. Em `all`, ambos os projetos precisam passar antes de qualquer alteração na AWS. O conteúdo é publicado sequencialmente: falhas interrompem o processo e retornam código diferente de zero. Se o segundo site falhar, o primeiro pode já estar atualizado; não há rollback automático nem transação atômica de conteúdo. Arquivos HTML individuais também podem ficar parcialmente atualizados se um upload falhar.

Não usamos `sync --delete`. Arquivos antigos, inclusive páginas removidas do código, continuam no bucket e podem permanecer acessíveis pelo CloudFront. A remoção deliberada e a limpeza de versões ficam para uma operação posterior. Os buckets possuem versionamento, `DeletionPolicy: Retain` e `UpdateReplacePolicy: Retain`; excluir a stack preserva dados e pode manter custos de armazenamento.

## Rotas, cache e outputs

O Slidev usa base `/` e modo history, com notas e modo apresentador públicos. Rotas sem extensão apontam para `/index.html`; arquivos ausentes continuam como erro de origem.

O catálogo mantém saída estática e sua configuração de URLs. A função resolve páginas com/sem barra final, versões semânticas e páginas de exemplos JSON. Downloads em `generated/`, documentos `.md`/`.mdx`, Mermaid, CSS e JS conservam seus caminhos. Exportações estáticas sem extensão em `api/`, `api-catalog/` e `.well-known/` também são preservadas; não representam um backend em execução. Novos formatos de rota que não sejam reconhecidos interrompem a verificação do build, antes do upload.

Apenas bundles JS/CSS com o fingerprint de oito caracteres nas pastas do compilador (`assets/` e `_astro/`) recebem `public,max-age=31536000,immutable`. HTMLs, JSONs e demais arquivos usam `public,max-age=0,must-revalidate`. A política CloudFront tem `MinTTL: 0`, respeitando a revalidação. A configuração de headers do servidor Vite local não é transferida ao CloudFront.

| Output | Finalidade |
|---|---|
| `PresentationBucketName` | Destino S3 da apresentação |
| `PresentationDistributionId` | Distribuição a invalidar |
| `PresentationUrl` | URL HTTPS da apresentação |
| `EventCatalogBucketName` | Destino S3 do catálogo |
| `EventCatalogDistributionId` | Distribuição a invalidar |
| `EventCatalogUrl` | URL HTTPS do catálogo |

## Permissões AWS

A stack não cria usuários nem roles de deploy. O OAC autoriza somente `s3:GetObject` nos objetos do bucket correspondente, condicionado ao ARN de sua distribuição; HTTP direto ao S3 é negado.

Para publicar conteúdo, a identidade precisa de `cloudformation:DescribeStacks` e `cloudformation:GetTemplate` na stack, `s3:ListBucket` nos buckets e `s3:PutObject` nos objetos dos frontends selecionados. A CLI pode consultar a localização/objetos (`s3:GetBucketLocation`, `s3:GetObject`). Para invalidação, precisa de `cloudfront:CreateInvalidation` e `cloudfront:GetInvalidation` nas distribuições selecionadas. O script também consulta `sts:GetCallerIdentity`.

Para criar/atualizar a infraestrutura, o executor do CloudFormation precisa gerenciar exclusivamente os tipos declarados no template: S3 Bucket/BucketPolicy e CloudFront Distribution/OriginAccessControl/Function/CachePolicy. A identidade do SAM precisa criar, descrever e executar change sets e consultar eventos/estado da stack. Defina a política de implantação na conta, com recursos e condições apropriados; não é concedido acesso administrativo por estes scripts. Não há necessidade de implantar as Lambdas fictícias do catálogo.

## Verificação local e CI

```bash
npm --prefix infra ci
npm --prefix infra test
sam validate --lint --template-file infra/template.yaml --region us-east-1
npm --prefix presentation test
npm --prefix presentation run build
npm --prefix event-catalog run verify
npm --prefix infra run test:builds
```

Os testes executam os scripts reais em diretórios temporários com espaços no nome e substituem apenas AWS/SAM/npm por executáveis simulados. Cobrem build inválido, cancelamento do SAM, stack ausente, outputs inválidos, template divergente, infraestrutura sem mudanças, falha de upload, ordem de publicação e isolamento entre sites. Não usam credenciais nem recursos AWS. O workflow da raiz executa testes, builds, verificação de rotas e lint SAM, sem permissões de deploy.

Opcionalmente, após gerar os dois builds, rode `npm --prefix infra run test:browser`. Esse smoke test usa o Playwright/Chromium da apresentação, serve os arquivos em portas locais efêmeras e aplica as mesmas funções do template para testar links profundos, recarga, notas e downloads. Se necessário, instale o Chromium conforme o [README da apresentação](../presentation/README.md). O teste desativa apenas a preferência Wake Lock no navegador headless, que não pode manter uma tela acordada. Ele não substitui a validação real de OAC/CloudFront na AWS.

## Verificação após a primeira publicação real

Abrir as duas URLs, recarregar um slide e `/presenter/1`, conferir imagens e notas; no catálogo, recarregar um evento versionado, um visualizador e uma página de exemplo, e baixar um YAML/JSON. Confirmar que arquivos inexistentes retornam 4xx e que uma requisição anônima direta ao bucket é negada. Publicar novamente apenas um frontend e conferir que só sua distribuição é invalidada.

Se o SAM falhar, consultar os eventos da stack e o primeiro `ResourceStatusReason` relevante antes de tentar novamente. Se a invalidação exceder o tempo de espera da CLI, consultar seu estado antes de repetir a publicação.

Referências: [templates SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy.html), [OAC](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html) e [template original no CloudFormation](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/get-template.html).
