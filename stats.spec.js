var assert = require('chai').assert;
var processStats = require( './stats' );


describe('processStats', function(){
    describe('bytesToGigs', function() {

        it('can handle 0', function(){
            var result = processStats.bytesToGigs(0);

            assert.equal(result, 0);
        });

        it('can correctly convert one megabyte', function(){
            var million = 1000000;
            var thousandth = .001;
            var result = processStats.bytesToGigs(million);

            assert.equal(result, thousandth);
        });

        it('can correctly convert two gigabytes', function(){
            var twoBillion = 2000000000;
            var result = processStats.bytesToGigs(twoBillion);

            assert.equal(result, 2);
        });
    });

    describe('calculateCpuLoad', function() {
        it('correctly calculate for one CPU', function(){
            var cpuCount = 1;
            var loadAverage = 0.265;

            var result = processStats.calculateCpuLoad(loadAverage, cpuCount);
            var expectResult = .265;

            assert.equal(result, expectResult);
        });

        it('correctly calculate for multiple CPUs', function(){
            var cpuCount = 4;
            var loadAverage = 0.8;

            var result = processStats.calculateCpuLoad(loadAverage, cpuCount);
            var expectResult = .2;

            assert.equal(result, expectResult);
        });

    });

    describe('systemHealthy', function() {
        var thresholds = {
            cpuUtilization: .8,
            availableMemory: .2,
            diskSpace: .5
        };

        it('correctly reports healthy system', function(){
            var stats = {
                cpuUtilization: .7,
                availableMemory: 1,
                diskSpace: 2
            };

            var result = processStats.systemHealthy(stats, thresholds);
            var expectResult = true;

            assert.equal(result, expectResult);
        });

        it('correctly reports high CPU usage', function(){
            var stats = {
                cpuUtilization: .82,
                availableMemory: 1,
                diskSpace: 2
            };

            var result = processStats.systemHealthy(stats, thresholds);
            var expectResult = false;

            assert.equal(result, expectResult);
        });

        it('correctly reports low memory availability', function(){
            var stats = {
                cpuUtilization: .6,
                availableMemory: .1,
                diskSpace: 2
            };

            var result = processStats.systemHealthy(stats, thresholds);
            var expectResult = false;

            assert.equal(result, expectResult);
        });

        it('correctly reports low disk space', function(){
            var stats = {
                cpuUtilization: .6,
                availableMemory: 2,
                diskSpace: .02
            };

            var result = processStats.systemHealthy(stats, thresholds);
            var expectResult = false;

            assert.equal(result, expectResult);
        });

    });

    describe('getStats', function() {
        var error, stats;

        before(function(done) {
            processStats.getStats(function(err, results){
                error = err;
                stats = results;

                done();
            });
        });

        it('should return CPU, memory, and isHealthy', function(){
            assert.isDefined(stats.cpuUtilization);
            assert.isDefined(stats.availableMemory);
            assert.isDefined(stats.diskSpace);
            assert.isDefined(stats.isHealthy);
        });
    });
});