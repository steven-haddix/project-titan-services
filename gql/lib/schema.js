import {
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLList,
    GraphQLString,
    GraphQLNonNull,
    GraphQLBoolean,
    GraphQLInt
} from 'graphql';

import {
    GraphQLLimitedString
} from 'graphql-custom-types';

import { getPlayer, getPlayers } from './dynamo';

const Player = new GraphQLObjectType({
    name: "Player",
    description: "Titan player",
    fields: () => ({
        playerId: {type: GraphQLString},
        email: {type: GraphQLString},
        isProvisional: {type: GraphQLBoolean},
        matchCount: {type: GraphQLInt},
        playerRank: {type: GraphQLInt}
    })
});

const Query = new GraphQLObjectType({
    name: 'TitanSchema',
    description: "Root of the Titan Schema",
    fields: () => ({
        players: {
            type: new GraphQLList(Player),
            description: "List of Players",
            resolve: function() {
                return getPlayers();
            }
        },
        player: {
            type: Player,
            description: "Get Player by id",
            args: {
                id: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve: function(source, {id}) {
                return getPlayer(id);
            }
        }
    })
});

const Schema = new GraphQLSchema({
    query: Query,
});

export default Schema;