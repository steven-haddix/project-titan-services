import config from '../config'
import * as dynamoDbLib from '../libs/dynamodb-lib';

export async function handler(event, context, callback) {
    const params = {
        TableName: config.DDB_PLAYERS_TABLE,
        Item: {
            partitionKey: 1,
            playerId: event.userName,
            email: event.request.userAttributes.email,
            playerRank: 1000,
            matchCount: 0,
            isProvisional: true,
            createdAt: new Date().getTime()
        },
        Expected: {
            playerId: { Exists: false }
        }
    };

    try {
        const result = await dynamoDbLib.call('put', params);
        callback(null, event)
    } catch (e) {
        callback(e);
    }
};
