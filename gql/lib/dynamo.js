import AWS from 'aws-sdk';
import config from '../../config';

AWS.config.update({ region:'us-east-1' });

const docClient = new AWS.DynamoDB.DocumentClient();

export function getPlayer(id) {
    return new Promise(function(resolve, reject) {
        const params = {
            TableName: config.DDB_PLAYERS_TABLE,
            Key: {
                playerId: id
            },
            AttributesToGet: [
                'playerId',
                'createdAt',
                'email',
                'isProvisional',
                'matchCount',
                'partitionKey',
                'playerRank'
            ]
        };

        docClient.get(params, function(err, data) {
            if (err) return reject(err);
            return resolve(data["Item"]);
        });
    });
}

export function getPlayers() {
    return new Promise(function(resolve, reject) {
        const params = {
            TableName: config.DDB_PLAYERS_TABLE,
            AttributesToGet: [
                'playerId',
                'createdAt',
                'email',
                'isProvisional',
                'matchCount',
                'partitionKey',
                'playerRank'
            ]
        };

        docClient.scan(params, function(err, data) {
            if (err) return reject(err);
            return resolve(data["Items"]);
        });
    });
}
