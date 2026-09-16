# AWS Community Day Sul 2026

Apresentação **De rotas HTTP a eventos: uma jornada prática para pensar EDA** e seu exemplo de documentação arquitetural.

| Diretório | Conteúdo | Documentação |
|---|---|---|
| `presentation/` | Apresentação Slidev, com notas e modo apresentador | [Executar e editar](presentation/README.md) |
| `event-catalog/` | EventCatalog estático e gerador a partir dos contratos | [Catálogo](event-catalog/README.md) |
| `infra/` | Uma stack SAM, com S3 e CloudFront exclusivos para cada frontend | [Deploy e validação](infra/README.md) |

Cada diretório tem seu próprio `.gitignore` e lockfile. Não há npm workspaces nem dependência de um frontend no outro. `infra/package.json` contém somente ferramentas de validação/deploy.

## Desenvolvimento local

Requisitos: Node.js 22.18 ou posterior e npm. Instale cada projeto separadamente:

```bash
npm --prefix presentation ci
npm --prefix presentation run dev
```

A apresentação abre em [127.0.0.1:3031](http://127.0.0.1:3031/1). Para o catálogo, em outro terminal:

```bash
npm --prefix event-catalog ci
npm --prefix event-catalog run generate
npm --prefix event-catalog run dev
```

O catálogo abre em [127.0.0.1:3117](http://127.0.0.1:3117). Os dois builds geram `dist/` dentro do respectivo projeto.

## Publicação

Os sites são públicos, cada um em seu endereço HTTPS `cloudfront.net`. O S3 aceita leitura apenas pelo CloudFront correspondente. A apresentação publicada inclui suas notas.

Primeira publicação, usando as credenciais padrão da AWS CLI e a região de exemplo `us-east-1`:

```bash
./infra/scripts/deploy-all.sh --region us-east-1
```

Substitua a região conforme sua conta. Todos os scripts aceitam `--profile` e `--stack-name`. Publicações seguintes podem usar `deploy-presentation.sh` ou `deploy-event-catalog.sh`; `deploy-infra.sh` atualiza apenas a infraestrutura. Veja os detalhes e permissões em [infra/README.md](infra/README.md).

O GitHub Actions apenas valida os projetos; não acessa a conta AWS nem publica sites.

## Origem e escopo

Os projetos foram importados do workspace da palestra, preservando fontes, assets utilizados, testes, atribuições e documentação interna. Dependências, builds, `.env`, PDFs gerados e backups `old/` não fazem parte da importação. Os arquivos originais permanecem no workspace anterior.

Os YAMLs de `event-catalog/architecture/` descrevem um sistema fictício e alimentam a documentação. Somente `infra/template.yaml` é um alvo de implantação. Licenças e atribuições de cada projeto continuam nos seus próprios diretórios.
