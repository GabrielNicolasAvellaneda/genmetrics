var program = require('commander');
var net = require('net')

var metricValue;

function range(val) {
  return val.split('..').map(Number);
}

program
  .version('0.0.1')
  .arguments('<metric>')
  .action(function (metric) {
    metricValue = metric
  })
  .usage('<metric> [options]')
  .option('-i, --interval <n>', 'Interval in seconds')
  .option('-r, --range <a>..<b>', 'Range of random number generation', range)
  .option('-h, --host', 'OpenTSDB host')
  .option('-p, --port', 'OpenTSDB port')
  .parse(process.argv);

program.interval = program.interval || 1000
program.range = program.range || [0, 100]
program.port = program.port || 4242
program.host = program.host || 'localhost'

if (typeof metricValue === 'undefined') {
  console.log('metric is required')
  process.exit(0)
}

function getRandom(from, to) {
  return Math.floor(Math.random()*(to-from)+from+1);                  
}

function getTimestamp() {
  return Math.floor(Date.now()/1000)
}

function format(metric, timestamp, value) { 
  var str = 'put ' + metric + ' ' + timestamp + ' ' + value + ' test=true' + "\n";

  return str;
}

console.log('Running with the following parameter:');
console.log('metric: ' + metricValue)
console.log('from: ' + program.range[0])
console.log('to: ' + program.range[1])

function run() {
  var client = net.connect({port: program.port}, function () {
    var interval = setInterval(function () {
      var value = getRandom(program.range[0], program.range[1])
      var toWrite = format(metricValue, getTimestamp(), value)

      console.log(toWrite);
      client.write(toWrite);
    }, program.interval);
  });
}

run()

