# Sonos Simple CLI

There are many better projects out there.

But this is one I am working on to play with Node CLI
and to use personally for the control of my own Sonos speakers.

## Features

- [ ] configuration file
- [x] acts only only the configured device
- [x] caches a found/configured device (faster startup)
- [x] supports pause/play toggle, and prev/next, vol +/-
- [x] built in support for Alfred Workflow (and thus a global hotkey shortcut)

## Thanks

A big thanks to the Sonos API implementation Lib I'm using:

https://github.com/bencevans/node-sonos

## Install

Ummmm... not sure yet...

Should this be a global CLI utilty?

### Manual Crappy Install

    cd ~
    mkdir bin
    git clone https://github.com/zeroasterisk/sonos-simple-cli.git
    cd sonos-simple-cli
    npm install
    cd ..
    ln -s sonos-simple-cli/sonos.js ./

## Manual Script Running

```
$ node ~/bin/sonos.js help
-----------------------------
----- Sonos Simple CLI ------
-----------------------------
node sonos.js playpause
node sonos.js play
node sonos.js pause
node sonos.js next
node sonos.js prev
node sonos.js volup
node sonos.js voldown
node sonos.js mute
node sonos.js unmute
node sonos.js mutetoggle
node sonos.js clearCache
-----------------------------

$ node ~/bin/sonos.js playpause
  > SONOS set to PAUSED
  Beastie Boys "I Don't Know"
    @ 58/180 sec
```

## Configure for Alfred

Alfred > Workflows

Click `+` (bottom left) to add a new Workflow

Click `+` (top right) to add an `trigger > hotkey`

Then choose your hotkey and save.

Click `+` (top right) to add an `action -> run script`

select `/bin/bash` at the top, then enter the following

    source ~/.profile
    /usr/local/bin/node ~/bin/sonos.js pauseplay

![ss](http://puu.sh/gY1g3/6b3971535b.png)

then click save.

Finally, drag a line between them.

![ss](http://puu.sh/gY1hB/33dd7b1162.png)

Bonus Points, output when done

Add an `output > notification` and setup as follows

![ss](http://puu.sh/gY211/4eaa413cdf.png)

then connect and you're all set
