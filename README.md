# Titan API

## Commands
### Loading data
```
aws dynamodb batch-write-item --request-items file://player/players.json --region us-east-1 --profile serverless
```