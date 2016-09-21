var os = require('os');
var diskspace = require('diskspace');

module.exports = {
    getStats: function(thresholdsOverride, callback){
        try{
            var oneMinAverageIndex = 0;
            //http://blog.scoutapp.com/articles/2009/07/31/understanding-load-averages
            var loadAverage = os.loadavg()[oneMinAverageIndex];
            var bytes = os.freemem();
            var gigs = this.bytesToGigs(bytes);
            var cpus = os.cpus();
            var loadPerCpu = this.calculateCpuLoad(loadAverage, cpus.length);
            var that = this;

            //Allow the first argument to be optional
            if(arguments.length == 1){
                callback = arguments[0];
                thresholdsOverride = {};
            }

            diskspace.check('/', function (err, total, free)
            {
                var freeSpace = that.bytesToGigs(free);
                var defaultThresholds = {
                    cpuUtilization: .8, //% used
                    availableMemory: .2, //Gigs available
                    diskSpace: .5 //Gigs free
                };

                var stats = {
                    cpuUtilization: loadPerCpu,
                    availableMemory: gigs,
                    diskSpace: freeSpace,
                };

                var thresholds = that.setDefaultThresholds(thresholdsOverride, defaultThresholds);

                stats.isHealthy = that.systemHealthy(stats, thresholds);

                callback(null, stats);
            });


        }
        catch(error){
            callback(error);
        }
    },

    setDefaultThresholds: function(overrides, defaults){
        var updatedThresholds = defaults;

        if(!overrides){
            return updatedThresholds;
        }

        if(overrides.cpuUtilization){
            updatedThresholds.cpuUtilization = overrides.cpuUtilization;
        }

        if(overrides.availableMemory){
            updatedThresholds.availableMemory = overrides.availableMemory;
        }

        if(overrides.diskSpace){
            updatedThresholds.diskSpace = overrides.diskSpace;
        }

        return updatedThresholds;
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



