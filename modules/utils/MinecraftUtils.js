//MinecraftUtils by Cerx

var request = require('request');
var MinecraftUtils = function () {};


/*
 *  <summary>
 *     Returns UUID for provided minecraft username
 *
 */
MinecraftUtils.prototype.getUUID = function(name, callback) {
        var timestamp = Date.now() / 1000 | 0; //Get current UNIX timestamp
        request('https://api.mojang.com/users/profiles/minecraft/'+name+'?at='+timestamp, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callback(JSON.parse(body));
            }
            else {
                console.error(error);
                callback(false);
            }
        });
};

/*
 *  <summary>
 *     Returns users Minecraft profile from the UUID
 *
 */
MinecraftUtils.prototype.getProfile = function(uuid, callback) {
        request(' https://sessionserver.mojang.com/session/minecraft/profile/'+uuid, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callback(JSON.parse(body));
            }
            else { 
                console.error(error);
                callback(false);
            }
        });
};/*
 *  <summary>
 *     Properly format the UUID (According to UUID v4 Standards xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx WHERE y = 8,9,A,or B and x = random digits.)
 *
 */
MinecraftUtils.prototype.formatUUID = function(uuid, callback) {
        var uid = "";
        uid += uuid.substr(0, 8)+"-";
        uid += uuid.substr(8, 4)+"-";
        uid += uuid.substr(12, 4)+"-";
        uid += uuid.substr(16, 4)+"-";
        uid += uuid.substr(20);
        return uid;
};
module.exports = new MinecraftUtils();
