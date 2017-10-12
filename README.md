# Titan Services
Project for deploying Titan services to AWS.

## Queries
### REST
```
GET /api/player/list
GET /api/matches/list
```

### GraphQL
Sample player query
```
POST /gql
{
  players {
    playerId,
    playerRank,
    email
  }
}
```

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