var os = require('os');
var diskspace = require('diskspace');

module.exports = {
    getStats: function(callback){
        try{
            var oneMinAverageIndex = 0;
            //http://blog.scoutapp.com/articles/2009/07/31/understanding-load-averages
            var loadAverage = os.loadavg()[oneMinAverageIndex];
            var bytes = os.freemem();
            var gigs = this.bytesToGigs(bytes);
            var cpus = os.cpus();
            var loadPerCpu = this.calculateCpuLoad(loadAverage, cpus.length);
            var that = this;

            diskspace.check('/', function (err, total, free)
            {
                var freeSpace = that.bytesToGigs(free);
                var thresholds = {
                    cpuUtilization: .8, //% used
                    availableMemory: 800.2, //Gigs available
                    diskSpace: .5 //Gigs free
                };

                var stats = {
                    cpuUtilization: loadPerCpu,
                    availableMemory: gigs,
                    diskSpace: freeSpace,
                };

                stats.isHealthy = that.systemHealthy(stats, thresholds);

                callback(null, stats);
            });


        }
        catch(error){
            callback(error);
        }
    },

    bytesToGigs: function(bytes){
        var billion = 1000000000;

        return (bytes/billion)
    },

    calculateCpuLoad: function(loadAverage, cpus){
        return (loadAverage/cpus);
    },

    systemHealthy: function(stats, thresholds){
        var isSystemHealthy = true;

        if(stats.cpuUtilization > thresholds.cpuUtilization){
            isSystemHealthy = false;
        }

        if(stats.availableMemory < thresholds.availableMemory){
            isSystemHealthy = false;
        }

        if(stats.diskSpace < thresholds.diskSpace){
            isSystemHealthy = false;
        }

        return isSystemHealthy;
    }
};



