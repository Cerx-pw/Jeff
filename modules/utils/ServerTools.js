var ServerTools = function () {};
var Client = require('ftp');
var fs = require('fs');

ServerTools.prototype.DownloadPlayerStats = function (config,callback) {
    var itemsProcessed = 0;
    var c = new Client();
    c.on('ready', function () {

        /*
         *  <summary>
         *     Downloads stats from remote server
         *
         */
        c.list("world/stats", function (err, list) {
            if (err) throw err;

            list.forEach(function (entry) {
                c.get('world/stats/' + entry.name, function (err, stream) {
                    if (err) throw err;
                    stream.once('close', function () {
                        c.end();
                    });
                    stream.pipe(dataStream = fs.createWriteStream('./data/playerdata/stats/' + entry.name));
                    dataStream.on('close', function() {
                        itemsProcessed++;
                        if (itemsProcessed === list.length) {
                            callback();
                        }
                    });
                });
            });
        });
    });
    var ftpConf = {"host": "93.91.250.143", "user":"27279_read", "password": "elkiaread"} //ftp thingy
    c.connect(ftpConf);
};

module.exports = new ServerTools();