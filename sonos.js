#!/usr/bin/env node
var userHome = require('user-home');
var path = require('path');
var nconf = require('nconf');
var flatCache = require('flat-cache')
var sonos = require('sonos');

// -----------------------------------------
//  CLI script runner
// -----------------------------------------

// TODO split to own file
var SonosSimpleCli = function SonosSimpleCli(args) {
  this.device = null;
  this.cache = null;
  this.conf(args);

  // look for cached "found" devices -- a heck of a lot faster
  this.cache = flatCache.load('sonosSimpleCliCache', path.resolve(nconf.get('tmp')));

  this.setupDevice(this.run.bind(this));
};

// help
SonosSimpleCli.prototype.help = function() {
  console.log('-----------------------------');
  console.log('----- Sonos Simple CLI ------');
  console.log('-----------------------------');
  console.log('node sonos.js playpause');
  console.log('node sonos.js play');
  console.log('node sonos.js pause');
  console.log('node sonos.js next');
  console.log('node sonos.js prev');
  console.log('node sonos.js volup');
  console.log('node sonos.js voldown');
  console.log('node sonos.js mute');
  console.log('node sonos.js unmute');
  console.log('node sonos.js mutetoggle');
  //console.log('node sonos.js config');
  console.log('node sonos.js clearCache');
  console.log('-----------------------------');
  process.exit(1);
};

// setup and configure
//   uses nconf for handling conditions
SonosSimpleCli.prototype.conf = function(args) {
  nconf.env().argv();
  nconf.use('file', {
    type: 'file',
    file: '.sonos.json',
    dir: userHome,
    search: true
  }).load();
  nconf.defaults({
    // What is the name of your SonosController?
    roomName : null,
    // Where we store the cache files (directory)
    tmp : '/tmp',
    // Placeholder where we will store the action
    action: this.getActionFromArgs(args)
  });

  // validate that we have a roomName
  if (nconf.get('roomName') === null) {
    console.log('You need to configure your Sonos Controller room name');
    console.log('');
    console.log('echo \'{\"roomName\": \"My Controller Room Here\"}\' > ~/.sonos.json');
    console.log('');
    console.log('  (sorry, you HAVE to do this, even if only 1 controller, for now)');
    process.exit(1);
  }

  // validate that we have an action
  if (nconf.get('action') === null) {
    console.log('You need to pass in an action');
    this.help();
  }

  // if we are clearCache
  if (nconf.get('action') == 'clearCache') {
    this.cache.removeKey('device');
    this.cache.save();
    console.log('  cache cleared');
    process.exit(0);
  }

}

// determine runAction
//   parses CLI arguments for supported actions
SonosSimpleCli.prototype.getActionFromArgs = function(args) {
  for (i = 0; i < args.length; i++) {
    switch(args[i]) {
      case 'help':
        this.help();
        break;
      case 'playpause':
        return args[i];
        break;
      case 'play':
        return args[i];
        break;
      case 'pause':
        return args[i];
        break;
      case 'next':
        return args[i];
        break;
      case 'prev':
        return args[i];
        break;
      case 'volup':
        return args[i];
        break;
      case 'voldown':
        return args[i];
        break;
      case 'mute':
        return args[i];
        break;
      case 'unmute':
        return args[i];
        break;
      case 'mutetoggle':
        return args[i];
        break;
      case 'clearCache':
        return args[i];
        break;
    }
  }
  return null;
};

// setupDevice
SonosSimpleCli.prototype.setupDevice = function(callback) {

  device = this.cache.getKey('device')
  if (device) {
    // device already set... cached...
    this.setDevice(new sonos.Sonos(device.host, device.port));

    // setup complete
    if (typeof callback == "function") {
      callback();
    }
    return;
  }

  // find and get the device, pass through callback
  // got get the device, and auto setup and run
  sonos.search(this.checkDevice.bind(this, callback));
};

// run functionality
SonosSimpleCli.prototype.run = function() {
  if (!this.sc) {
    console.log(this);
    console.log('Can not run - no SonosController Setup');
    this.help();
  }

  return this.sc.runAction(nconf.get('action'));
};

// callback, checks the device
SonosSimpleCli.prototype.checkDevice = function(callback, device) {
  device.deviceDescription(this.checkDeviceCB.bind(this, callback, device));
};

// when we get the callback
SonosSimpleCli.prototype.checkDeviceCB = function(callback, device, err, info) {
  if (!device) {
    console.log('ERR - no device for checkDeviceCB()');
    process.exit(1);
  }
  if (err) {
    console.log('ERR - checkDeviceCB()');
    console.log(err);
    process.exit(1);
  }
  if (info.roomName != nconf.get('roomName')) {
    return;
  }

  // valid device - setting it now
  this.setDevice(device);

  if (typeof callback == "function") {
    callback();
  }
};


// callback, sets the device
SonosSimpleCli.prototype.setDevice = function(device) {
  // this is our selected controller
  this.device = device;
  this.cache.setKey('device', device);
  this.cache.save();

	// make a new sc (SonosController)
  this.sc = new SonosController(device);
};



// -----------------------------------------
// SonosController per-device workflow
// -----------------------------------------

// TODO split to own file
var SonosController = function SonosController(device) {
  this.device = device;
  this.info = null;
};



// handle any callback error
SonosController.prototype._handleIfError = function(err, message) {
  if (err) {
    console.log(message);
    console.log(err);
    process.exit(1);
  }
};

// run the action (TODO switch to script runner?)
SonosController.prototype.runAction = function(action) {
  switch(action) {
    case 'playpause':
      this.doPausePlay();
      break;
    case 'pauseplay':
      this.doPausePlay();
      break;
    case 'play':
      this.doPlay();
      break;
    case 'pause':
      this.doPause();
      break;
    case 'next':
      this.doNext();
      break;
    case 'prev':
      this.doPrev();
      break;
    case 'volup':
      this.doVolup();
      break;
    case 'voldown':
      this.doVoldown();
      break;
    case 'mute':
      this.doMuteon();
      break;
    case 'unmute':
      this.doMuteoff();
      break;
    case 'mutetoggle':
      this.doMutetoggle();
      break;
    default:
      return false;
  }
  return true;
};

// do Pause/Play
SonosController.prototype.doPausePlay = function() {
  this.device.getCurrentState(
      function(err, state) {
        this._handleIfError(err);
        if (state == 'paused') {
          this.doPlay();
        } else {
          this.doPause();
        }
      }.bind(this)
  );
};

SonosController.prototype.doPlay = function() {
  this.device.play(
    function(err) {
      this._handleIfError(err);
      console.log('  > SONOS set to PLAYING');
      this.doGetTrackInfoAndExit();
    }.bind(this)
  );
};

SonosController.prototype.doPause = function() {
  this.device.pause(
    function(err) {
      this._handleIfError(err);
      console.log('  > SONOS set to PAUSED');
      this.doGetTrackInfoAndExit();
    }.bind(this)
  );
};

SonosController.prototype.doNext = function() {
  this.device.next(
    function(err) {
      this._handleIfError(err);
      console.log('  > SONOS going to NEXT >>');
      this.doGetTrackInfoAndExit();
    }.bind(this)
  );
};

SonosController.prototype.doPrev = function() {
  this.device.previous(
    function(err) {
      this._handleIfError(err);
      console.log('  > SONOS going to PREV <<');
      this.doGetTrackInfoAndExit();
    }.bind(this)
  );
};

SonosController.prototype.doVolup = function() {
  this.device.getVolume(function(callback, volume) {
    volume = Math.min(100, volume + 10);
    this.device.setVolume(
      volume,
      function(err) {
        this._handleIfError(err);
        console.log('  > SONOS volume + to ' + volume + '%');
        this.doGetTrackInfoAndExit();
      }.bind(this)
    );
  }.bind(this));
};

SonosController.prototype.doVoldown = function() {
  this.device.getVolume(function(err, volume) {
    this._handleIfError(err);
    volume = Math.max(0, volume - 10);
    this.device.setVolume(
      volume,
      function(err) {
        this._handleIfError(err);
        console.log('  > SONOS volume - to ' + volume + '%');
        this.doGetTrackInfoAndExit();
      }.bind(this)
    );
  }.bind(this));
};

SonosController.prototype.doMuteon = function() {
  this.device.setMuted(
    1,
    function(err) {
      this._handleIfError(err);
      console.log('  > SONOS volume MUTED');
      this.doGetTrackInfoAndExit();
    }.bind(this)
  );
};

SonosController.prototype.doMuteoff = function() {
  this.device.setMuted(
    0,
    function(err) {
      this._handleIfError(err);
      console.log('  > SONOS volume UN-MUTED');
      this.doGetTrackInfoAndExit();
    }.bind(this)
  );
};

SonosController.prototype.doMutetoggle = function() {
  this.device.getMuted(
    function(err, muted) {
      this._handleIfError(err);
      if (muted) {
        this.doMuteoff();
      } else {
        this.doMuteon();
      }
    }.bind(this)
  );
};


// do Get Current Track Info
SonosController.prototype.doGetTrackInfo = function() {
  this.device.currentTrack(this.doGetTrackInfoCB.bind(this));
};
SonosController.prototype.doGetTrackInfoCB = function(err, track) {
  this._handleIfError(err);
  console.log('  ' + track.artist + ' "' + track.title + '"');
  console.log('    @ ' + track.position + '/' + track.duration + ' sec');
};
SonosController.prototype.doGetTrackInfoAndExit = function() {
  this.device.currentTrack(this.doGetTrackInfoAndExitCB.bind(this));
  setTimeout(function() {
    console.log('...timout...');
    process.exit(0);
  }, 3000);
};
SonosController.prototype.doGetTrackInfoAndExitCB = function(err, track) {
  this.doGetTrackInfoCB(err, track);
  process.exit(0);
};


/**
 * ---------------------------------------
 * automatic on script run
 * ---------------------------------------
 * uses cached Sonos Device
 *   or searches for all Sonos Devices
 *     when any are found
 *       if they are in the right roomName, cache and use Sonos Device
 *
 * do runAction on the Sonos Device
 */



// run the CLI
var cli = new SonosSimpleCli(process.argv);

