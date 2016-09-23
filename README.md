# Health Checker

Returns high level information on overall server health, including:
* CPU Utilization (%)
* Free Memory (gigs)
* Disk space (gigs)

Additionally returns a boolean *isHealthy*, which indicates if any of the 
values exceed certain thresholds. While there are default thresholds, you
may override these values to meet your specific needs.

## Installation

npm install

## Usage

```javascript
var healthChecker = require('health_checker');

var thresholdOverride = {
    availableMemory = .1
};

healthChecker.getStats(thresholdOverride, function(error, results){
    if(error){
        console.log("Oh no!");
    }else{
        //Do something with the results
    }
});
```

###Sample Results

```javascript
{
    cpuUtilization: 0.01904296875,
    availableMemory: 2.828726272,
    interval: 5,
    diskSpace: 4.427292672,
    isHealthy: true
}
```

###CPU Utilization
CPU Utilization is a calculated value. It takes the load average returned 
by the OS, and divides it by the number of CPUs. The load average is based 
on either a 1, 5, or 15 minute interval. (The default setting is 5 minutes.)
Note that the interval only applies to the CPU, and not the other value.

### Default Thresholds

The system uses default threshold values, to determine if the *isHealthy*
value is set to true or false. You can ignore this value, or potentially
take some action such as triggering an alert. All of these default values
can be overridden, to suit your specific needs.

```javascript
var defaultThresholds = {
    cpuUtilization: .8, //80% utilized
    interval: 5, //Average load over 5 min. (Only applies to CPU)
    availableMemory: .2, //200 megs available
    diskSpace: .5 //500 megs free
    
};
```