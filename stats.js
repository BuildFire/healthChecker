var os = require('os');
var diskspace = require('diskspace');

module.exports = {
    getStats: function(options, callback){
        try{
            //Allow the first argument to be optional
            if(arguments.length == 1){
                callback = arguments[0];
                options = {};
            }

            var defaultThresholds = {
                cpuUtilization: .9, //% used
                availableMemory: .2, //Gigs available
                diskSpace: .5, //Gigs free
                interval: 1 //Average over 1 min
            };

            var thresholds = this.setThresholds(options, defaultThresholds);
            var loadAverageIndex = this.convertIntervalToIndex(thresholds.interval);
            var loadAverage = os.loadavg()[loadAverageIndex];
            var bytes = os.freemem();
            var gigs = this.bytesToGigs(bytes);
            var cpus = os.cpus();
            var loadPerCpu = this.calculateCpuLoad(loadAverage, cpus.length);
            var addresses = this.getIPAddress();

            var stats = {
                cpuUtilization: loadPerCpu,
                availableMemory: gigs,
                interval: thresholds.interval,
                addresses: addresses
            };

            if(options.alias){
                stats.alias = options.alias;
            }

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

    getIPAddress: function(){
        var addresses = {};
        var networkInterfaces = os.networkInterfaces();

        //https://nodejs.org/api/os.html#os_os_networkinterfaces
        Object.keys(networkInterfaces).forEach(function (networkInterface) {
            var i = 0;

            networkInterfaces[networkInterface].forEach(function (address) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                if (address.family ==='IPv4' && !(address.internal)) {
                    var key =  (i === 0) ? networkInterface : networkInterface + '.' + i ;

                    addresses[key] = address.address;
                    ++i;
                }
            });
        });

        return addresses;
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