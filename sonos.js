var sonos = require('sonos');


// -----------------------------------------
//  CLI script runner
// -----------------------------------------

// TODO split to own file
var SonosSimpleCli = function SonosSimpleCli(args) {
  this.device = null;
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
  return this.config.action;
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
  sonos.search(this.setDevice.bind(this));
};
// callback, sets the device
SonosSimpleCli.prototype.setDevice = function(device) {
  sc = new SonosController(device);
  sc.config = this.config;
  if (!sc.selected()) {
    return;
  }
  // this is our selected controller
  this.device = device;
  this.sc = sc;
  // run callback
  this.runAction(this.config.action);
};

SonosSimpleCli.prototype.runAction = function(action) {
  if (!this.sc.runAction(this.config.action)) {
    console.log('ran but returned false');
    process.exit(1);
  }
  // ran successfully
  console.log('ran successfully');
  process.exit(0);
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

// get device info - select to self
SonosController.prototype.selected = function() {
    this.device.deviceDescription(this.selectedCB.bind(this));
    //(SonosController.confirm.bind(undefined, device));
};
// when we get the callback
SonosController.prototype.selectedCB = function(err, info) {
  this._handleIfError(err);
  this.info = info;
  if (info.roomName != this.config.roomName) {
    return false;
  }
  this.runAction();
};

// run the action (TODO switch to script runner?)
SonosController.prototype.runAction = function() {
  switch(this.config.action) {
    case 'playpause':
      this.doGetTrackInfo();
      this.doPausePlay();
    break;
    case 'play':
      this.doGetTrackInfo();
      this.doPlay();
    break;
    case 'pause':
      this.doGetTrackInfo();
      this.doPause();
    break;
    case 'next':
      this.doNext();
    break;
    case 'prev':
      this.doPrev();
    break;
  }
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
  this.device.play(this.doSetPlayCB.bind(this));
};
SonosController.prototype.doSetPlayCB = function(err, state) {
  this._handleIfError(err);
  if (!state) {
    console.log('  ???? SONOS not set to PLAYING ???? ');
    process.exit(1);
  }
  console.log('  > SONOS set to PLAYING');
  this.doGetTrackInfoAndExit();
};

SonosController.prototype.doPause = function() {
  this.device.pause(this.doSetPauseCB.bind(this));
};
SonosController.prototype.doSetPauseCB = function(err, state) {
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
  this.device.previous(this.doSetPrevCB.bind(this));
};

SonosController.prototype.doSetPrevCB = function(err, state) {
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
};
SonosController.prototype.doGetTrackInfoAndExitCB = function(err, track) {
  this.doGetTrackInfoCB(err, track);
  process.exit(0);
};



// run the CLI
var cli = new SonosSimpleCli(process.argv);

