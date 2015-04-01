# Sonos Simple CLI

There are many better projects out there.

But this is one I am working on to play with Node CLI
and to use personally for the control of my own Sonos speakers.

## Features

- [ ] configuration file
- [x] acts only only the configured device
- [x] supports pause/play toggle
- [ ] built in support for Alfred Workflow (and thus a global hotkey shortcut)

## Thanks

A big thanks to the Sonos API implementation Lib I'm using:

https://github.com/bencevans/node-sonos

## Install

    cd ~
    mkdir sonos
    npm install sonos-simple-cli

or

    cd ~
    mkdir sonos
    npm install https://github.com/zeroasterisk/sonos-simple-cli.git

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
