import uuid from 'node-uuid'
import Elo from 'arpad';
import config from '../config'
import * as dynamoDbLib from '../libs/dynamodb-lib';
import { success, failure } from '../libs/response-lib';

const provisionalThreshold = 5;

const getPlayerRanks = (winner, loser) => {
    const elo = new Elo()

    let loserRank = loser.playerRank

    if (!winner.isProvisional || winner.matchCount + 1 > provisionalThreshold ) {
        loserRank = elo.newRatingIfLost(loser.playerRank, winner.playerRank)
    }

    return {
        winnerRank: elo.newRatingIfWon(winner.playerRank, loser.playerRank),
        loserRank
    }
}

export async function getPlayer(playerId) {
    const params = {
        TableName: config.DDB_PLAYERS_TABLE,
        // 'Key' defines the partition key and sort key of the time to be retrieved
        // - 'userId': federated identity ID of the authenticated user
        // - 'noteId': path parameter
        Key: {
            playerId: playerId,
            playerRank: undefined,
        },
    };
    console.log('Get player params', params)
    const result = await dynamoDbLib.call('get', params);
    console.log('Player result', result)

    if (result.Item) {
        return result.Item
    } else {
        throw new Error(`Unable to get player rank for ${playerId}`)
    }
}

export async function updatePlayerRank(player, rank) {
    const params = {
        TableName: config.DDB_PLAYERS_TABLE,
        // 'Key' defines the partition key and sort key of the time to be updated
        // - 'userId': User Pool sub of the authenticated user
        // - 'noteId': path parameter
        Key: {
            playerId: player.playerId,
        },
        // 'UpdateExpression' defines the attributes to be updated
        // 'ExpressionAttributeValues' defines the value in the update expression
        UpdateExpression: 'SET playerRank = :playerRank, matchCount = :matchCount, isProvisional = :isProvisional',
        ExpressionAttributeValues: {
            ':playerRank': rank,
            ':matchCount': player.matchCount !== undefined ? player.matchCount + 1 : 1,
            ':isProvisional': player.matchCount + 1 <= provisionalThreshold
        },
        ReturnValues: 'ALL_NEW',
    };

    await dynamoDbLib.call('update', params);
    return rank;
}

export async function handler(event, context, callback) {
    console.log('Event: ', event)
    const body = JSON.parse(event.body);
    console.log('Body: ', body)
    const winnerId = body.winnerId;
    const loserId = body.loserId;

    const params = {
        TableName: config.DDB_MATCHES_TABLE,
        Item: {
            partitionKey: 1,
            winnerId: winnerId,
            loserId: loserId,
            matchId: uuid.v4(),
            createdAt: new Date().getTime(),
        },
    };

    try {
        const winner = await getPlayer(winnerId)
        console.log(`Old winner rank: ${winner.playerRank}`)
        const loser = await getPlayer(loserId)
        console.log(`Old loser rank: ${loser.playerRank}`)

        const playerRanks = getPlayerRanks(winner, loser)
        await updatePlayerRank(winner, playerRanks.winnerRank)
        console.log(`New winner rank: ${playerRanks.winnerRank}`)

        await updatePlayerRank(loser, playerRanks.loserRank)
        console.log(`New loser rank: ${playerRanks.loserRank}`)

        const result = await dynamoDbLib.call('put', params)

        callback(null, success({
            winner: {
                id: winnerId,
                oldRank: winner.playerRank,
                newRank: playerRanks.winnerRank
            },
            loser: {
                id: loserId,
                oldRank: loser.playerRank,
                newRank: playerRanks.loserRank
            }
        }));
    } catch(e) {
        console.log(e)
        callback(null, failure({ message: e }));
    }
}
