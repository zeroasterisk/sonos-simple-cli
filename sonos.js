var sonos = require('sonos');
var path = require('path');
var flatCache = require('flat-cache')

// -----------------------------------------
//  CLI script runner
// -----------------------------------------

// TODO split to own file
var SonosSimpleCli = function SonosSimpleCli(args) {
  this.device = null;
  this.cache = null;
  this.config = {
    roomName : 'Office/Upstairs',
    action: 'pausePlay'
  };
  this.setup(args);
  this.run();
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
  //console.log('node sonos.js config');
  console.log('-----------------------------');
  process.exit(1);
};

// determine runAction
//   parses CLI arguments for supported actions
SonosSimpleCli.prototype.setup = function(args) {
  // get the action
  this.config.action = null;
  for (i = 0; i < process.argv.length; i++) {
    switch(process.argv[i]) {
      case 'playpause':
        this.config.action = process.argv[i];
        break;
      case 'play':
        this.config.action = process.argv[i];
        break;
      case 'pause':
        this.config.action = process.argv[i];
        break;
      case 'next':
        this.config.action = process.argv[i];
        break;
      case 'prev':
        this.config.action = process.argv[i];
        break;
    }
  }
  // get the controller roomName
  // TODO
  // no action? fail
  if (this.config.action == null) {
    console.log('BAD ACTION');
    this.help();
  }


  // look for cached "found" devices -- a heck of a lot faster
  this.cache = flatCache.load('sonosSimpleCliCache');
  device = this.cache.getKey('device')
  if (device) {
    this.device = new sonos.Sonos(device.host, device.port);
  }
  console.log('this.device from cache');
  console.log(this.device);


};

// run functionality
SonosSimpleCli.prototype.run = function() {
  if (this.sc) {
    // sc already set... cached...
    return this.runAction(this.config.action);
  }
  if (this.device) {
    // device already set... cached...
    return this.setDevice(this.device);
  }
  // got get the device, and auto setup and run
  this.getDevice();
};

// run functionality
//   searches for sonos components and runs action
//   TODO - cache last found component
SonosSimpleCli.prototype.getDevice = function() {
  sonos.search(this.checkDevice.bind(this));
};

// callback, checks the device
SonosSimpleCli.prototype.checkDevice = function(device) {
  device.deviceDescription(this.checkDeviceCB.bind(this, device));
};

// when we get the callback
SonosSimpleCli.prototype.checkDeviceCB = function(device, err, info) {
  if (!device) {
    console.log('ERR - no device for checkDeviceCB()');
    process.exit(1);
  }
  if (err) {
    console.log('ERR - checkDeviceCB()');
    console.log(err);
    process.exit(1);
  }
  if (info.roomName != this.config.roomName) {
    return;
  }
  this.setDevice(device);
};


// callback, sets the device
SonosSimpleCli.prototype.setDevice = function(device) {
  console.log('setDevice');
  console.log(device);
  sc = new SonosController(device);
  sc.config = this.config;
  // this is our selected controller
  this.device = device;
  this.cache.setKey('device', device);
  this.cache.save();
  this.sc = sc;
  // run callback
  this.runAction(this.config.action);
};

// run the action on out configured device / SonosController
SonosSimpleCli.prototype.runAction = function(action) {
  if (!this.sc) {
    console.log('ERR - runAction() has no this.sc setup');
    console.log(err);
    process.exit(1);
  }
  if (!this.sc.runAction(this.config.action)) {
    console.log('ran but returned false');
    process.exit(1);
  }
};



/**
 * ---------------------------------------
 * automatic on script run
 * ---------------------------------------
 * searches for all Sonos Devices
 * when any are found, is it a "selected" one
 * if not, abort
 * if selected, do runAction to run the desired action
 */

// sonos.search - searches for Sonos devices on network

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
    default:
      return false;
  }
  return true;
};

// do Pause/Play
SonosController.prototype.doPausePlay = function() {
  this.device.getCurrentState(this.doPausePlayCB.bind(this));
};
SonosController.prototype.doPausePlayCB = function(err, state) {
  this._handleIfError(err);
  if (state == 'paused') {
    this.doPlay();
  } else {
    this.doPause();
  }
};

SonosController.prototype.doPlay = function() {
  this.device.play(this.doPlayCB.bind(this));
};
SonosController.prototype.doPlayCB = function(err, state) {
  this._handleIfError(err);
  if (!state) {
    console.log('  ???? SONOS not set to PLAYING ???? ');
    process.exit(1);
  }
  console.log('  > SONOS set to PLAYING');
  this.doGetTrackInfoAndExit();
};

SonosController.prototype.doPause = function() {
  this.device.pause(this.doPauseCB.bind(this));
};
SonosController.prototype.doPauseCB = function(err, state) {
  this._handleIfError(err);
  if (!state) {
    console.log('  ???? SONOS not set to PAUSED ???? ');
    process.exit(1);
  }
  console.log('  > SONOS set to PAUSED');
  this.doGetTrackInfoAndExit();
};

SonosController.prototype.doNext = function() {
  this.device.next(this.doSetNextCB.bind(this));
};
SonosController.prototype.doSetNextCB = function(err, state) {
  this._handleIfError(err);
  console.log('  > SONOS going to NEXT >>');
  this.doGetTrackInfoAndExit();
};

SonosController.prototype.doPrev = function() {
  this.device.previous(this.doPrevCB.bind(this));
};
SonosController.prototype.doPrevCB = function(err, state) {
  this._handleIfError(err);
  console.log('  > SONOS going to PREV <<');
  this.doGetTrackInfoAndExit();
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
  this.device.currentTrack(this.doGetTrackInfoCB.bind(this));
  setTimeout(function() {
    console.log('...timout...');
    process.exit(0);
  }, 3000);
};
SonosController.prototype.doGetTrackInfoAndExitCB = function(err, track) {
  this.doGetTrackInfoCB(err, track);
  process.exit(0);
};



// run the CLI
var cli = new SonosSimpleCli(process.argv);

