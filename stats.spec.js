var assert = require('chai').assert;
var expect = require('chai').expect;
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

    describe('convertIntervalToIndex', function() {
        it('throws and exception on non numeric value', function(){
            assert.throws(function(){
                processStats.convertIntervalToIndex("A")
            }, Error, "Not a valid interval");
        });

        it('throws and exception on non interger value', function(){
            assert.throws(function(){
                processStats.convertIntervalToIndex(1.25)
            }, Error, "Not a valid interval");
        });

        it('converts 5 min to index 1', function(){
            var result = processStats.convertIntervalToIndex(5);
            var expectResult = 1;

            assert.equal(result, expectResult);
        });
    });

    describe('overrideDefaultThresholds', function(){
        it('correctly handles null override', function(){
            var defaultThresholds = {
                cpuUtilization: .8,
                availableMemory: .2,
                diskSpace: .5
            };
            var result = processStats.setThresholds(null, defaultThresholds);
            var expectResult = defaultThresholds;

            assert.deepEqual(result, expectResult);
        });

        it('correctly handles empty override object', function(){
            var defaultThresholds = {
                cpuUtilization: .8,
                availableMemory: .2,
                diskSpace: .5
            };
            var result = processStats.setThresholds({}, defaultThresholds);
            var expectResult = defaultThresholds;

            assert.deepEqual(result, expectResult);
        });

        it('correctly overrides the CPU default', function(){
            var defaultThresholds = {
                cpuUtilization: .8,
                availableMemory: .2,
                diskSpace: .5
            };
            var result = processStats.setThresholds({cpuUtilization: .7}, defaultThresholds);
            var expectResult = {
                cpuUtilization: .7,
                availableMemory: .2,
                diskSpace: .5
            };

            assert.deepEqual(result, expectResult);
        });

        it('correctly overrides the memory default', function(){
            var defaultThresholds = {
                cpuUtilization: .8,
                availableMemory: .2,
                diskSpace: .5
            };
            var result = processStats.setThresholds({availableMemory: .5}, defaultThresholds);
            var expectResult = {
                cpuUtilization: .8,
                availableMemory: .5,
                diskSpace: .5
            };

            assert.deepEqual(result, expectResult);
        });

        it('correctly overrides the disk space default', function(){
            var defaultThresholds = {
                cpuUtilization: .8,
                availableMemory: .2,
                diskSpace: .5
            };
            var result = processStats.setThresholds({diskSpace: 1}, defaultThresholds);
            var expectResult = {
                cpuUtilization: .8,
                availableMemory: .2,
                diskSpace: 1
            };

            assert.deepEqual(result, expectResult);
        });

        it('correctly overrides the interval default', function(){
            var defaultThresholds = {
                cpuUtilization: .8,
                availableMemory: .2,
                diskSpace: .5,
                interval: 5
            };
            var result = processStats.setThresholds({interval: 15}, defaultThresholds);
            var expectResult = {
                cpuUtilization: .8,
                availableMemory: .2,
                diskSpace: .5,
                interval: 15
            };

            assert.deepEqual(result, expectResult);
        });

        it('correctly overrides cpu, memory, and disk space', function(){
            var defaultThresholds = {
                cpuUtilization: .8,
                availableMemory: .2,
                diskSpace: .5
            };
            var override = {
                cpuUtilization: .7,
                availableMemory: .5,
                diskSpace: 1
            };

            var result = processStats.setThresholds(override, defaultThresholds);
            var expectResult = {
                cpuUtilization: .7,
                availableMemory: .5,
                diskSpace: 1
            };

            assert.deepEqual(result, expectResult);
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

        before(function(done) {
            var overrides =  {};

            processStats.getStats(overrides, function(err, results){
                error = err;
                stats = results;

                done();
            });
        });

        it('works with empty override', function(){
            assert.isDefined(stats.cpuUtilization);
            assert.isDefined(stats.availableMemory);
            assert.isDefined(stats.diskSpace);
            assert.isDefined(stats.isHealthy);
        });

        before(function(done) {
            var overrides =  null;

            processStats.getStats(overrides, function(err, results){
                error = err;
                stats = results;

                done();
            });
        });

        it('works with null override', function(){
            assert.isDefined(stats.cpuUtilization);
            assert.isDefined(stats.availableMemory);
            assert.isDefined(stats.diskSpace);
            assert.isDefined(stats.isHealthy);
        });

        before(function(done) {
            //Specify values that will return false
            var overrides =  {
                cpuUtilization: 0,
                availableMemory: 256,
            };

            processStats.getStats(overrides, function(err, results){
                error = err;
                stats = results;

                done();
            });
        });

        it('should respect overrides', function(){
            var expectResult = false;

            assert.equal(stats.isHealthy, expectResult);
        });
    });
});