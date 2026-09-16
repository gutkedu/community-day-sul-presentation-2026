# EventCatalog: Contracts Give Architecture Meaning

Public, fictional order-system example for an AWS Community Day talk. OpenAPI and AsyncAPI are the contract sources; AWS SAM records the infrastructure view; the TypeScript generator projects them into EventCatalog.

```bash
npm ci
npm run generate
npm run dev
```

Run the complete verification pipeline with:

```bash
npm run verify
```

The example backend is documentation-only: its SAM templates have no executable Lambda handlers and are never deployed by this repository. Local development requires no AWS account.

## Static website deployment

This project builds to `dist/`. The shared SAM stack in [`../infra`](../infra/README.md) provides its own private S3 bucket and CloudFront distribution. From the repository root, with the stack already created:

```bash
./infra/scripts/deploy-event-catalog.sh --region us-east-1
```

Use `deploy-all.sh` for the first publication of both frontends. Region is required; AWS profile and stack name are optional. The deploy validates contracts, generates the catalog, lints it and checks the build routes before uploading. The GitHub workflow at the repository root runs verification only.

## References and license

- [EventCatalog](https://www.eventcatalog.dev/)
- [OpenAPI 3.1](https://spec.openapis.org/oas/v3.1.0)
- [AsyncAPI 3.0](https://www.asyncapi.com/docs/reference/specification/v3.0.0)
- [AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)
- [Third-party attributions](./ATTRIBUTIONS.md)

Licensed under the [MIT License](./LICENSE).
