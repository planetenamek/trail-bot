module.exports = {
  "token"  : process.env.TOKEN,
  "prefix" : "$",
  "trackerVoter" : "petanque",
  "tagTrackerVoter" : "steempress",
  "comment_account" : [
    {"username" : "petanque", "wif" : process.env.FRSTARS_WIF}
  ],
  "comment_message" : "Great post ! Upvoted",
  "master_vote" : [
    {"username" : "howo", "wif" : process.env.PLANTER_WIF}
  ]
};
