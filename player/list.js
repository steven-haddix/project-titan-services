import config from '../config.json'
import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';

export async function handler(event, context, callback) {
    const params = {
        TableName: config.DDB_PLAYERS_TABLE,
        IndexName: 'partitionKeyIndex',
        KeyConditionExpression: 'partitionKey = :partitionKey AND playerRank > :playerRank',
        ExpressionAttributeValues: {
            ':partitionKey': 1,
            ':playerRank': -1000
        },
        ScanIndexForward: false
    };

    try {
        const result = await dynamoDbLib.call('query', params);
        if (result.Items) {
            callback(null, success(result.Items))
        } else {
            callback(null, failure({status: false, error: 'Item not found.'}));
        }
    } catch (e) {
        callback(null, failure(e));
    }
};
