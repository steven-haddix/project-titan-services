// Require Logic
const lib = require('./lib');

// Lambda Handler
export async function handler(event, context) {
    console.log(event);
    lib.runGraphQL(event.body, function(error, response) {
        console.log(response);
        return context.done(error, response);
    });
}
