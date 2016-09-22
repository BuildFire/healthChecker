var os = require('os');
var diskspace = require('diskspace');

module.exports = {
    getStats: function(thresholdsOverride, callback){
        try{
            //Allow the first argument to be optional
            if(arguments.length == 1){
                callback = arguments[0];
                thresholdsOverride = {};
            }

            var defaultThresholds = {
                cpuUtilization: .8, //% used
                availableMemory: .2, //Gigs available
                diskSpace: .5, //Gigs free
                interval: 5 //Average of 5 min
            };

            var thresholds = this.setThresholds(thresholdsOverride, defaultThresholds);
            var loadAverageIndex = this.convertIntervalToIndex(thresholds.interval);
            var loadAverage = os.loadavg()[loadAverageIndex];
            var bytes = os.freemem();
            var gigs = this.bytesToGigs(bytes);
            var cpus = os.cpus();
            var loadPerCpu = this.calculateCpuLoad(loadAverage, cpus.length);

            var stats = {
                cpuUtilization: loadPerCpu,
                availableMemory: gigs,
                interval: thresholds.interval
            };

            var that = this;

            diskspace.check('/', function (err, total, free)
            {
                stats.diskSpace = that.bytesToGigs(free);
                stats.isHealthy = that.systemHealthy(stats, thresholds);

                callback(null, stats);
            });
        }
        catch(error){
            callback(error);
        }
    },

    convertIntervalToIndex: function(interval){
        if(interval != 1 && interval != 5 && interval != 15){
            throw new Error("Not a valid interval.");
        }

        var loadAverageIndexes = {
            1: 0,
            5: 1,
            15: 2
        };

        return loadAverageIndexes[interval];
    },

    setThresholds: function(overrides, defaults){
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

        if(overrides.interval){
            updatedThresholds.interval = overrides.interval;
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