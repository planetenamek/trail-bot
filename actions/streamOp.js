const Discord = require("discord.js");
const steem = require("steem");
const config = require("./../config.json");

const {
  nodes
} = require("./../nodes");

var bot = new Discord.Client({
  autoReconnect: true
});
var index = 0;

bot.login(config.token);

function stream() {
  steem.api.setOptions({
    url: nodes[index]
  });
  return new Promise((resolve, reject) => {
    console.log('Connected to', nodes[index]);

    steem.api.streamOperations((err, operation) => {
      if (err) return reject(err);

      if (operation[0] == "vote") { // Check all votes from steem blockchain
        let voter = operation[1].voter
        // Check if the voter is tracked or not
        if (voter == config.trackerVoter) {
          let author = operation[1].author,
            permlink = operation[1].permlink,
            weight = operation[1].weight / 100;
          // Get tags from checking tracked tag
          steem.api.getContent(author, permlink, function(err, res) {
            try {
              let data = JSON.parse(res.json_metadata)
              tag = data.tags;
            } catch (err) {
              console.log("Error : " + err);
              return;
            }
            // If tag is tracked send vote
            if (typeof tag != "undefined" && tag.indexOf(config.tagTrackerVoter) != (-1)) {
              for (i = 0; i > config.master_vote.length; i++) {
                let wif = config.master_vote[i].wif
                trail_voter = config.master_vote[i].username
                // Send vote
                upvote(wif, trail_voter, author, permlink, weight)
                if (i === 0) {
                  // Send comment
                  comment(author, permlink)
                }
              }
            }
          });
        }
      } // End if vote
    });

  }).catch(err => {
    console.log('Stream error:', err.message, 'with', nodes[index]);
    index = ++index === nodes.length ? 0 : index;
    stream();
  });
}

function upvote(wif, voter, author, permlink, weight) {
  steem.broadcast.vote(wif, voter, author, permlink, weight, function(err, result) {
    if (err) {
      console.log("Error : " + err);
    } else {
      console.log("Upvote from : " + voter)
    }
  });
}

function comment(author, permlink) {
  wif = config.comment_account[0].wif,
    username = config.comment_account[0].username,
    permlink2 = steem.formatter.commentPermlink(author, permlink),
    content = config.comment_message;

  steem.broadcast.comment(wif, author, permlink, username, permlink2, permlink2, content, '{"app":"trail-bot"}', function(err, result) {
    if (!err && result) {
      console.log("Posted comment: " + permlink + " " + author);
    } else {
      console.log('Error posting comment: ' + permlink);
    }
  });
}

exports.stream = stream;
