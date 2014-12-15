var spawn = require('child_process').spawn;
var conf = require( './conf.js' );
var async = require( 'async' );
var whereis = require( 'whereis' );
var path = require( 'path' );

module.exports = standalone;

var killEvents = ['exit', 'SIGTERM', 'SIGINT'];
var processes = [];
var registered = false;

/**
 * Get a standalone selenium server running with
 * chromedriver available
 * @param  {Object} spawnOptions={ stdio: 'inherit' }
 * @param  {string[]} seleniumArgs=[]
 * @return {ChildProcess}
 */
function standalone(spawnOptions, seleniumArgs) {
  if (!registered) {
    killEvents.forEach(listenAndKill);
    registered = true;
  }

  spawnOptions = spawnOptions || { stdio: 'inherit' };
  seleniumArgs = seleniumArgs || [];

  var args = [
    '-jar',
    conf.selenium.path,
    '-Dwebdriver.chrome.driver=' + conf.chromeDr.path
  ];

  if (process.platform === 'win32') {
    args.push('-Dwebdriver.ie.driver=' + conf.ieDr.path);
  }

  args = args.concat(seleniumArgs);

  var selenium = spawn('java', args, spawnOptions);

  processes.push(selenium);

  return selenium;
}

function kill() {
  var process;
  while (process = processes.shift()) {
    process.kill('SIGTERM');
  }

  killEvents.forEach(unregister);
}

function listenAndKill(evName) {
  process.on(evName, kill);
}

function unregister(evName) {
  process.removeListener(evName, kill);
}

// backward compat with original programmatic PR
// https://github.com/vvo/selenium-standalone/pull/4
standalone.start = standalone;
