module.exports = {
  "token"  : process.env.TOKEN,
  "prefix" : "$",
  "trackerVoter" : "fr-stars",
  "tagTrackerVoter" : "fr",
  "comment_account" : [
    {"username" : "fr-stars", "wif" : process.env.FRSTARS_WIF}
  ],
  "comment_message" : "Ce post a été supporté par notre initiative de curation francophone @fr-stars. \nRendez-vous sur notre serveur [**Discord**](https://discord.gg/CcNs5uP) pour plus d'informations",
  "master_vote" : [
    {"username" : "planter", "wif" : process.env.PLANTER_WIF}
  ]
};
