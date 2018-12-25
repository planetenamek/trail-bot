const Discord = require("discord.js");
var dsteem = require('dsteem');
const config = require("../config.js");
var es = require('event-stream')


const client = new dsteem.Client('https://api.steemit.com');// We use buildteam's node as they are the fastest but feel free to use https://api.steemit.com

var bot = new Discord.Client({
  autoReconnect: true
});
var index = 0;

bot.login(config.token);

/**
 * From a block number, gets it and parses the informations within it to store them on the blockchain
 * @param {int} blocknb - block number to parse.
 */
async function parseBlock(blocknb) {
    console.log(blocknb);
    const block = await client.database.getBlock(blocknb);
    const tx = block['transactions'];
    for (let i = 0; i < tx.length; i++) { // iterate over each transaction
        for (let y = 0; y < tx[i]['operations'].length; y++) { // iterate over each operation of each transaction
            if (tx[i]['operations'][y][0] === "vote") { // Vote
                const vote = tx[i]['operations'][y][1];

                let voter = vote.voter;
                // Check if the voter is tracked or not
                if (voter === config.trackerVoter) {
                    console.log("got an author from ")
                    let author = vote.author,
                        permlink = vote.permlink,
                        weight = vote.weight;

                    const post = await client.database.call("get_content", [author, permlink]);


                    let tag = "undefined";

                    try {
                        let data = JSON.parse(post.json_metadata)
                        tag = data.tags;
                    } catch (err) {
                        console.log("Error : " + err);
                        return;
                    }
                    // If tag is tracked send vote
                    if (typeof tag !== "undefined" && tag.indexOf(config.tagTrackerVoter) !== -1) {
                        for (let i = 0; i < config.master_vote.length; i++) {
                            let wif = config.master_vote[i].wif;
                            const trail_voter = config.master_vote[i].username;
                            // Send vote
                            if (await vote_err_handled(trail_voter, wif, author, permlink, weight) === "")
                                console.log("Upvote from : " + trail_voter);
                            if (i === 0) {
                                // Send comment
                                await comment(author, permlink)
                                console.log("comment"+author+" "+permlink);
                            }
                        }
                    }
                }
            }
        }
    }
}



function stream() {
    console.log("Starting parser");

    let stream_feed = client.blockchain.getBlockNumberStream();

    stream = client.blockchain.getBlockStream();
    stream.on('data', parseBlock);

//            stream_feed.pipe(es.map(function (block, callback) {
  //      callback(null, parseBlock(block))
  //}));
}



/**
 * Creates a comment on the steem blockchain
 * @param {String} author - Author of the post to comment to
 * @param {String} permlink - permanent link of the post to comment to. eg : https://steemit.com/programming/@howo/introducting-steemsnippets the permlink is "introducting-steemsnippets"
 */
function comment(author,  permlink) {
    const privateKey = dsteem.PrivateKey.fromString(config.comment_account[0].wif);
    const jsonMetadata = '{"app":"trail-bot"}';
    const comment_permlink = new Date().toISOString().replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();
    const username = config.comment_account[0].username

    client.broadcast.comment({
        author: username,
        title : '',
        body :  config.comment_message,
        json_metadata : jsonMetadata,
        parent_author : author ,
        parent_permlink: permlink,
        permlink : comment_permlink
    }, privateKey).catch(function(error) {
        console.error(error)
    });
}

function vote_err_handled(username, wif, author, permlink, percentage)
{
  return new Promise(async resolve => {
    let result = await vote(username, wif, author, permlink, percentage);

    if (result !== "") {
      for (let k = 0; k < 10; k++) {
        console.error("vote failed for " + username + " voting on "+author+"/"+permlink);
        result = await vote(username, wif, author, permlink, percentage);
        if (result === "")
          return resolve("");
      }
    } else
      return resolve("");

    return resolve(result);
  });
}


function wait(time)
{
  return new Promise(resolve => {
    setTimeout(() => resolve('☕'), time*1000); // miliseconds to seconds
  });
}



function vote(username, wif, author, permlink, weight) {

  return new Promise(async resolve => {

    const private_key = dsteem.PrivateKey.fromString(wif);

    await client.broadcast.vote({
      voter: username,
      author: author,
      permlink: permlink,
      weight: weight
    }, private_key).catch(async function(error) {
      if (error.message.indexOf("Can only vote once every 3 seconds") !== -1)
        console.error("Can only vote once every 3 seconds");
      else if (error.message === "HTTP 504: Gateway Time-out" || error.message === "HTTP 502: Bad Gateway" || error.message.indexOf("request to https://api.steemit.com failed, reason: connect ETIMEDOUT") !== -1 || error.message.indexOf("transaction tapos exception") !== -1)
        console.error("Error 504/502");
      else
        console.error(error);
      await wait(5);
      return resolve(error);
    });

    await wait(5);
    return resolve("");

  })
}




module.exports = {
                  stream
};
