//ElkiaUtils by Cerx

var request = require('request');
var Elkia= function () {};


/*
 *  <summary>
 *     Returns UUID for provided minecraft username
 *
 */
Elkia.prototype.getQueryFeed = function(callback) {
    var timestamp = Date.now() / 1000 | 0; //Get current UNIX timestamp
    request('http://query.fakaheda.eu/93.91.250.143:27279.feed', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(JSON.parse(body));
        }
        else {
            console.error(error);
            callback(false);
        }
    });
};

module.exports = new Elkia();
