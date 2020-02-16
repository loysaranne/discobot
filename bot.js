var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var fs = require('fs');
const doodleFile = 'doodle.json';
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
  colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
  token: auth.token,
  autorun: true
});
bot.on('ready', function (evt) {
  logger.info('Connected');
  logger.info('Logged in as: ');
  logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt) {
  // Our bot needs to know if it will execute a command
  // It will listen for messages that will start with `!`
  if (message.substring(0, 1) == '!') {
    var args = message.substring(1).split(' ');
    var cmd = args[0];
    
    args = args.splice(1);
    switch(cmd) {
      case 'voteAdd':
        fs.readFile(doodleFile, 'utf8', function readFileCallback(err, data) {
          if (err){
            console.log(err);
            bot.sendMessage({
              to: channelID,
              message: `There was an error: ${err}`
            });
          } else {
            obj = JSON.parse(data);
            if (args.length < 2) {
              bot.sendMessage({
                to: channelID,
                message: `Not enough arguments`
              });
            } else {
              const name = args[0];
              const answers = [];
              for (let i = 1; i < args.length; i++) {
                answers.push({
                  id: i,
                  name: args[i],
                  votes: []
                });
              }
              obj.push({
                name: args[0],
                answers: answers
              });
              json = JSON.stringify(obj);
              fs.writeFile(doodleFile, json, 'utf8', () => null);
              bot.sendMessage({
                to: channelID,
                message: `Vote created succesfully!`
              });
            }
          }
        });
      break;
      case 'vote':
        fs.readFile(doodleFile, 'utf8', function readFileCallback(err, data) {
          if (err){
            console.log(err);
            bot.sendMessage({
              to: channelID,
              message: `There was an error: ${err}`
            });
          } else {
            obj = JSON.parse(data);
            if (args.length < 2) {
              bot.sendMessage({
                to: channelID,
                message: `Not enough arguments`
              });
            } else {
              const name = args[0];
              const votes = [];
              for (let i = 1; i < args.length; i++) {
                votes.push({
                  id: i,
                  name: args[1]
                });
              }
              const vote = obj.find(vote => vote.name === args[0]);
              if (!vote) {
                bot.sendMessage({
                  to: channelID,
                  message: `No Vote with a name ${args[0]}`
                });
              } else {
                const votes = [];
                for (let i = 1; i < args.length; i++) {
                  const addVote = Number(args[i]);
                  console.log(addVote);
                  if (addVote > 0 && vote.answers[addVote - 1]) {
                    vote.answers[addVote - 1].votes.push(user);
                  }
                }
                json = JSON.stringify(obj);
                fs.writeFile(doodleFile, json, 'utf8', () => null); 
                bot.sendMessage({
                  to: channelID,
                  message: `Vote added!`
                });
              }
            }
          }
        });
      break;
      case 'voteView':
        fs.readFile(doodleFile, 'utf8', function readFileCallback(err, data) {
          if (err){
            console.log(err);
            bot.sendMessage({
              to: channelID,
              message: `There was an error: ${err}`
            });
          } else {
            obj = JSON.parse(data);
            if (args.length < 1) {
              bot.sendMessage({
                to: channelID,
                message: `Not enough arguments`
              });
            } else {
              const vote = obj.find(vote => vote.name === args[0]);
              if (!vote) {
                bot.sendMessage({
                  to: channelID,
                  message: `No Vote with a name ${args[0]}`
                });
              } else {
                let voteString = '';
                vote.answers.forEach((answer, index) => {
                  voteString += `${index+1}: ${answer.name} voted for ${answer.votes.length} times by`;
                  answer.votes.forEach(answerer => {
                    voteString += ` ${answerer}`
                  });
                  voteString += '\n';
                });
                bot.sendMessage({
                  to: channelID,
                  message: `Votes for ${vote.name}\n${voteString}`
                });
              }
            }
          }
        });
      break;
      case 'voteRemove':
        fs.readFile(doodleFile, 'utf8', function readFileCallback(err, data) {
          if (err){
            console.log(err);
            bot.sendMessage({
              to: channelID,
              message: `There was an error: ${err}`
            });
          } else {
            obj = JSON.parse(data);
            if (args.length < 1) {
              bot.sendMessage({
                to: channelID,
                message: `Not enough arguments`
              });
            } else {
              const name = args[0];
              const vote = obj.findIndex(vote => vote.name === name);
              obj.splice(vote, 1);
              json = JSON.stringify(obj);
              fs.writeFile(doodleFile, json, 'utf8', () => null);
              bot.sendMessage({
                to: channelID,
                message: `Vote removed succesfully!`
              });
            }
          }
        });
      break;
      // !ping
      case 'ping':
        bot.sendMessage({
          to: channelID,
          message: 'Pong!'
        });
      break;
      case "whoami":
        bot.sendMessage({
          to: channelID,
          message: 'Hello. You are ' + evt
        })
      break;
      case "cmd":
        bot.sendMessage({
          to: channelID,
          message: 'cmd with args: ' + args[0] + args[1]
        })
      break;
      // Just add any case commands if you want to..
    }
  }
});