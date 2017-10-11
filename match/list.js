import config from '../config'
import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';

async function getPlayer(playerId) {
    const params = {
        TableName: config.DDB_PLAYERS_TABLE,
        Key: {
            playerId: playerId,
        },
    };
    //console.log('Get player params', params)
    const result = await dynamoDbLib.call('get', params);
    //console.log('Player result', result)

    if (result.Item) {
        return result.Item
    } else {
        throw new Error(`Unable to get player rank for ${playerId}`)
    }
}

async function getMatchPlayers(match) {
    const playerEmails = {}

    const winner = await getPlayer(match.winnerId)
    playerEmails.winnerEmail = winner.email

    const loser = await getPlayer(match.loserId)
    playerEmails.loserEmail = loser.email

    return Object.assign({}, match, playerEmails);
}

export async function handler(event, context, callback) {
    const params = {
        TableName: config.DDB_MATCHES_TABLE,
        IndexName: 'partitionKeyIndex',
        KeyConditionExpression: 'partitionKey = :partitionKey AND createdAt > :createdAt',
        ExpressionAttributeValues: {
            ':partitionKey': 1,
            ':createdAt': 0
        },
        MaxItems: 20,
        ScanIndexForward: false
    };

    try {
        const result = await dynamoDbLib.call('query', params)
        if (result.Items) {
            const promises = result.Items.slice(0, 19).map(match => getMatchPlayers(match))
            console.log('Promises: ', promises)

            const items = await Promise.all(promises)
            console.log('Items: ', items)
            callback(null, success(items))
        } else {
            callback(null, failure({status: false, error: 'Item not found.'}))
        }
    } catch (e) {
        callback(null, failure(e))
    }
};
