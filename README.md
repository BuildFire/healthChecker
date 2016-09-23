# healthChecker

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
var healthChecker = require( 'health_checker' );

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

###Sample Output

```javascript
{
    cpuUtilization: 0.01904296875,
    availableMemory: 2.828726272,
    interval: 5,
    diskSpace: 4.427292672,
    isHealthy: true
}
```
