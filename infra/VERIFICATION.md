# Verificação da inicialização — 16/09/2026

Escopo: importar os dois projetos atuais, configurar seus ignores e builds, acrescentar uma stack SAM com dois pares S3/CloudFront, scripts locais e CI de validação.

## Evidências locais

- `npm --prefix presentation ci`: instalação independente concluída.
- `npm --prefix presentation test`: 31 testes passaram.
- `npm --prefix presentation run build`: build Slidev concluído com base `/`, notas e modo apresentador.
- `npm --prefix event-catalog ci`: instalação independente concluída.
- `npm --prefix event-catalog run verify`: 13 testes passaram; 35 arquivos gerados a partir dos contratos; lint sem problemas; 115 páginas estáticas construídas.
- `npm --prefix infra test`: 19 testes de template, roteamento, cache e scripts passaram usando executáveis AWS/SAM/npm simulados.
- `npm --prefix infra run test:builds`: 175 arquivos da apresentação e 741 do catálogo verificados contra as funções CloudFront do template, incluindo todos os caminhos de páginas com/sem barra final.
- `sam validate --lint --template-file infra/template.yaml --region us-east-1`: template válido com SAM 1.161.0.
- `bash -n` nos quatro scripts de entrada e `deploy-all.sh --help`: passaram.
- YAML do workflow validado; permissões limitadas a `contents: read`; tags das actions verificadas no remoto.
- `npm --prefix infra run test:browser`: seis rotas abriram e recarregaram no Chromium, incluindo modo apresentador, notas, evento versionado, visualizador e exemplo JSON; downloads de JSON/YAML funcionaram; arquivo ausente retornou 404 no servidor local; nenhum erro JavaScript não tratado.

O smoke test usa servidores temporários em portas efêmeras, aplica as funções do template e desativa somente Wake Lock no navegador headless. Não testa OAC, IAM ou propagação real de CloudFront.

## Preservação e Git

A comparação SHA-256 das cópias com a origem cobriu 85 arquivos da apresentação e 77 do catálogo. Somente `.gitignore`, `README.md` e `package.json` diferem na apresentação; no catálogo, também difere o nome do pacote no lockfile. Nenhum conteúdo de slides, componente, contrato ou gerador foi alterado pela importação.

Dependências, builds, caches, `.env` e backups `old/` estão fora do versionamento. A varredura dos arquivos elegíveis não encontrou formatos de chaves privadas nem tokens GitHub/AWS. O remoto estava vazio, sem commits e sem `origin/main`; esta entrega é o bootstrap local, sem histórico ou merges de outra tarefa. Não há card Plane associado a este projeto pessoal.

## Limites e pendências

Nenhuma publicação na AWS foi executada e o workflow não foi executado no GitHub. Permanecem pendentes o push e a primeira publicação na conta/região escolhidas.

Os builds existentes emitiram avisos não bloqueantes: Node 26 sobre localStorage; EventCatalog sobre diretório opcional de usuários vazio, bundles grandes e rotas de edição sem handler GET no modo estático. As dependências foram preservadas nos lockfiles.

A publicação de conteúdo é sequencial, não atômica, e não possui rollback automático. Buckets/versionamentos são retidos; objetos antigos não são removidos automaticamente. A validação real de acesso anônimo ao S3, HTTPS e invalidações está descrita no README de infraestrutura.
