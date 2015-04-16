var program = require('commander');
var net = require('net')

var metrics = []

function range(val) {
  return val.split('..').map(Number);
}

program
  .version('0.0.1')
  .arguments('<metric> [others...]')
  .action(function (metric, others) {
    metrics.push(metric)
    if (others) {
     others.forEach(function (m) {
      metrics.push(m)
     })
    }
  })
  .usage('[options] <metric ...>')
  .option('-i, --interval <n>', 'Interval in seconds')
  .option('-r, --range <a>..<b>', 'Range for random number generation. i.e. [0..100]', range)
  .option('-h, --host', 'OpenTSDB host')
  .option('-p, --port', 'OpenTSDB port')
  .description('Generate random test metrics for OpenTSDB')
  .on('--help', function () {
    console.log('  Examples:')
    console.log('')
    console.log('    $ gemmetrics machine01.heat');
    console.log('    $ genmetrics -r 0..110 machine01.voltage');
    console.log('    $ genmetrics --host localhost --port 4242 machine01.bomb.pressure machine01.powersupply.voltage machine02.cutter.speed');
    console.log('    $ genmetrics --host opentsdb.yourserver.com --port 4242 --range 0..500 machine02.speed')
    console.log('')
    console.log('  Notes: The options will be the same for all the specified metrics')
    console.log('')
}).parse(process.argv);

program.interval = program.interval || 1000
program.range = program.range || [0, 100]
program.port = program.port || 4242
program.host = program.host || 'localhost'

if (metrics.length == 0) {
  program.help()
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
console.log('metric: ' + metrics.join(','))
console.log('from: ' + program.range[0])
console.log('to: ' + program.range[1])

function run() {
  var client = net.connect({port: program.port}, function () {
    var interval = setInterval(function () {
      metrics.forEach(function (metric) {
        var value = getRandom(program.range[0], program.range[1])
        var toWrite = format(metric, getTimestamp(), value)
        console.log(toWrite.replace('\n', ''));
        client.write(toWrite);
      })
          }, program.interval);
  });
}

run()

