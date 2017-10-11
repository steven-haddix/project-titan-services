# Titan Services
Project for deploying Titan services to AWS.

## Commands
### Deploy Infrastructure
```bash
$ serverless deploy --profile serverless --stage dev
$ serverless deploy --profile serverless --stage prod
```

### Loading data
```bash
$ aws dynamodb batch-write-item --request-items file://player/players.json --region us-east-1 --profile serverless
```