var Discord = require("discord.js"); //Discord bot library
var schedule = require('node-schedule'); //Sheduling jobs
var http = require('http');
var fs = require('fs');
var config = require("./config/conf.json");
var Minecraft = require('./modules/utils/MinecraftUtils.js');
var Utils = require('./modules/Utils.js');
var Elkia = require('./modules/utils/ElkiaUtils.js');

var Jeff = new Discord.Client({
    autoReconnect: true
});

var cluster = require('cluster');
    if (cluster.isMaster) {
        cluster.fork();
        console.log("Applying current Jeff's configuration on Timmy...");
        /*Allows to restart the program*/
        cluster.on('exit', function(worker, code, signal) {
            cluster.fork();
            console.log("...Oh snap. Nevermind! We're going to need another Timmy.");
                    });
    }
    if (cluster.isWorker) {
        /*Actual code*/
        Jeff.on("message", function (message) {
            var msg = message.content.split(" ");   //Split message to args by space.
            if (msg[0] != null) {                   //What are the odds of this happening?
                if (msg[0].charAt(0) == "~") {      //Using the "?" as a prefix

                    //Remove the prefix
                    while (msg[0].charAt(0) === '~')
                        msg[0] = msg[0].substr(1);

                    console.log(msg);


                    /*
                     *  <summary>
                     *     If x"ing" is recieved, replies x"ong!"
                     *     Used to test if the bot is alive
                     *
                     */
                    var possiblePing = msg[0].substr(1);
                    if (possiblePing == 'ing') {
                        Jeff.sendMessage(message.channel, msg[0].charAt(0) + "ong!");
                    }

                    /*
                     *  <summary>
                     *     Responds with user's time that he played on the server.
                     *
                     */
                    else if (msg[0] == 'playtime') {
                        if (msg[1] != null) {
                            var player = msg[1];
                            player = player.replace(/\D/g, '');
                        }
                        else var player = message.author.id;
                        Utils.GetAssociations(function (ignData) {
                            Minecraft.getProfile(ignData[player], function (result) {
                                if (!result) {
                                    Jeff.sendMessage(message.channel, "There is no Discord association with <@" + player + ">! Please, contact Admins.")
                                }
                                else {
                                    fs.readFile("./data/playerdata/stats/" + Minecraft.formatUUID(ignData[player]) + ".json", function (err, data) {
                                        var t = JSON.parse(data)['stat.playOneMinute'];
                                        var sec_num = parseInt(t / 20, 10); // don't forget the second param
                                        var hours = Math.floor(sec_num / 3600);
                                        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
                                        var seconds = sec_num - (hours * 3600) - (minutes * 60);

                                        if (hours < 10) {
                                            hours = "0" + hours;
                                        }
                                        if (minutes < 10) {
                                            minutes = "0" + minutes;
                                        }
                                        if (seconds < 10) {
                                            seconds = "0" + seconds;
                                        }
                                        var time = hours + ' hours and ' + minutes + ' minutes';
                                        Jeff.sendMessage(message.channel, result.name + " has played on the server for " + time + ".");
                                    })

                                }
                            });
                        })
                    }





                    else if (msg[0] == 'lastseen') {
                        if (msg[1] != null) {
                            var player = msg[1];
                            player = player.replace(/\D/g, '');
                        }
                        else var player = message.author.id;
                        Utils.GetAssociations(function (ignData) {
                                if (!ignData) {
                                    Jeff.sendMessage(message.channel, "There is no Discord association with <@" + player + ">! Please, contact Admins.")
                                }
                                else {
                                    Utils.GetActivity(function (data) {
                                        console.log(data[ignData[player]])
                                        if(data[ignData[player]] === undefined){
                                            Jeff.sendMessage(message.channel, "<@" + player + "> is hiding from me!");
                                        }
                                        else{
                                            Jeff.sendMessage(message.channel, "<@" + player + "> was last seen "+ Utils.timeSince(data[ignData[player]]) +" ago");
                                        }
                                    })
                                }
                        });
                    }

                    /*
                     *  <summary>
                     *     Responds with user's time that he played on the server.
                     *
                     */
                    else if (msg[0] == 'online') {
                        Elkia.getQueryFeed(function (data) {
                            if (!data) {
                                Jeff.sendMessage(message.channel, "Eithier the hosting provider is having an outage or Cerx programmed it worng.")
                            }
                            else {
                                var itemsProcessed = 0;
                                var players = "";
                                console.log(data);
                                data.players_list.forEach(function (player) {
                                    players += ", " + player.name;
                                    itemsProcessed++;
                                    if (itemsProcessed === data.players_list.length) {
                                        if (players != "") {
                                            Jeff.sendMessage(message.channel, players.substr(2));
                                        }
                                        else {
                                            Jeff.sendMessage(message.channel, "Nobody is currently online.");

                                        }
                                    }
                                });
                                if (players == "") {
                                    Jeff.sendMessage(message.channel, "Nobody is currently online.");
                                }
                            }
                        });
                    }

                    else if (msg[0] == 'deaths') {
                        if (msg[1] != null) {
                            var player = msg[1];
                            player = player.replace(/\D/g, '');
                        }
                        else var player = message.author.id;
                        Utils.GetAssociations(function (ignData) {
                            Minecraft.getProfile(ignData[player], function (result) {
                                if (!result) {
                                    Jeff.sendMessage(message.channel, "There is no Discord association with <@" + player + ">! Please, contact Admins.")
                                }
                                else {
                                    fs.readFile("./data/playerdata/stats/" + Minecraft.formatUUID(ignData[player]) + ".json", function (err, data) {
                                        Jeff.sendMessage(message.channel, result.name + " has died " + JSON.parse(data)['stat.deaths'] + " times so far.");
                                    });
                                }
                            });
                        });
                    }

                    else if (msg[0] == 'forceupdate') {
                        Jeff.startTyping(message.channel);
                        var Tools = require('./modules/utils/ServerTools.js');
                        Tools.DownloadPlayerStats(config, function (callback) {
                            Jeff.stopTyping(message.channel);
                            Jeff.sendMessage(message.channel, "Successfully retrieved playerdata from the server...");
                        });
                    }
                }
            }
        });

        var botToken = require("./config/token.json");
        Jeff.loginWithToken(botToken.token);
        Jeff.on("ready", function () {


            //count Timmys
            fileList = './data/Counter.txt';
            fs.readFile(fileList, function (err, data) {
                if (err) throw err;
                data = parseInt(data.toString());
                data = data + 1;
                fs.writeFile(fileList, data, function () {
                    Jeff.setStatus("available", "build #" + data, function () {
                        console.log("Timmy is ready!");
                    });
                });
            });

        });

        //Set the bot icon
        /*
        fs.readFile('./config/bot_icon.png', function read(err, data) {
            if (err) {
                throw err;
            }
            avatar = "data:image/png;base64," + new Buffer(data).toString("base64");
            Jeff.setAvatar(avatar);
        });*/

        /*
         *  <summary>
         *     Cache players stats every 5 minutes
         *
         */
        var cron5mins = schedule.scheduleJob('*/10 * * * *', function () {
            var Tools = require('./modules/utils/ServerTools.js');
            Tools.DownloadPlayerStats(config, function (callback) {
                console.log("Retrieved playerdata from remote server...");
            });
        });
        var onemincron = schedule.scheduleJob('* * * * *', function () {
            Elkia.getQueryFeed(function (data) {
                if (!data) {
                    console.log("Failed to update activity database")
                }
                else {
                    var itemsProcessed = 0;
                    Utils.GetActivity(function (lastseen) {
                        data.players_list.forEach(function (player) {
                            Minecraft.getUUID(player.name, function (uuid) {
                                itemsProcessed++;
                                lastseen[uuid.id] = Date.now();
                                if (itemsProcessed === data.players_list.length) {

                                    fs.writeFile("./data/playerdata/activity.json", JSON.stringify(lastseen), "utf8",  function(err) {
                                        if(err) {
                                            return console.log(err);
                                        }
                                        console.log(JSON.stringify(lastseen));
                                        console.log("Updated activity database!");
                                    });
                                }
                            });
                        });
                    });

                }
            });
        });
    }



