var sonos = require('sonos');
//var _ = require('underscore');


var SonosController = function SonosController(device) {
  this.device = device;
  this.info = null;
  this.config = {
    // TODO paramaterize
    roomName : 'Office/Upstairs',
    action: 'pausePlay'
  };
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

// run the action (TODO implement paramaterized actions)
SonosController.prototype.runAction = function() {
  // TODO paramaterize
  this.doGetTrackInfo();
  this.doPausePlay();
};

// do Pause/Play
SonosController.prototype.doPausePlay = function() {
  this.device.getCurrentState(this.doPausePlayCB.bind(this));
};
SonosController.prototype.doPausePlayCB = function(err, state) {
  this._handleIfError(err);
  console.log('  currently: ' + state);
  // switch to Play
  if (state == 'paused') {
    this.device.play(this.doSetPlayCB.bind(this));
  } else {
    this.device.pause(this.doSetPauseCB.bind(this));
  }
};
SonosController.prototype.doSetPlayCB = function(err, state) {
  this._handleIfError(err);
  if (!state) {
    console.log('SONOS not set to PLAYING ???? ');
    process.exit(1);
  }
  console.log('SONOS set to PLAYING');
  process.exit();
};
SonosController.prototype.doSetPauseCB = function(err, state) {
  this._handleIfError(err);
  if (!state) {
    console.log('SONOS not set to PAUSED ???? ');
    process.exit(1);
  }
  console.log('SONOS set to PAUSED');
  process.exit();
};

// do Get Current Track Info
SonosController.prototype.doGetTrackInfo = function() {
  this.device.currentTrack(this.doGetTrackInfoCB.bind(this));
};
SonosController.prototype.doGetTrackInfoCB = function(err, track) {
  this._handleIfError(err);
  console.log('  current track: ' + track.artist + ' "' + track.title + '"');
  console.log('                 ' + track.position + '/' + track.duration);
};


/*
  getCurrent: function(device) {
    device.currentTrack(
      function(err, track) {
        if (err) {
          return;
        }
        if (!track.artist) {
          return;
        }
        console.log('current: ' + track.artist + ' ' + track.title);
      }
    );
  },
 */

// sonos.search - searches for Sonos devices on network
sonos.search(function(device) {
  var sc = new SonosController(device);
  if (sc.selected()) {
    // this is our selected controller
    if (!sc.runAction('pausePlay')) {
      console.log('ran but returned false');
      process.exit(1);
    }
    // ran successfully
    console.log('ran successfully');
    process.exit(0);
  }
});








//process.exit(code=0);

