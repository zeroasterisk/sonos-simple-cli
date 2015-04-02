# Sonos Simple CLI

There are many better projects out there.

But this is one I am working on to play with Node CLI
and to use personally for the control of my own Sonos speakers.

## Features

- [x] acts only only the configured device via `roomName` config file `~/.sonos.json`
- [x] caches a found/configured device (faster startup)
- [x] supports pause/play toggle, and prev/next, vol +/-
- [x] built in support for Alfred Workflow (and thus a global hotkey shortcut)
- [x] configuration file `~/.sonos.json` to setup which `roomName` you want to use
- [ ] fix Alfred path so we don't need the `~/bin/` symlink
- [ ] better configuration file setup
- [ ] support for "get first" vs. configured `roomName`

## Thanks

A big thanks to the Sonos API implementation Lib I'm using:

https://github.com/bencevans/node-sonos

## Install

```
$ npm install sonos-simple-cli -g
```

If you want to use Alfred Workflow - it has path problems which I'm currently
solving with an explicit symlink *(something more elegant coming)*

```
cd ~
mkdir bin
cd bin
ln -s $(which sonos-simple-cli) sonos-simple-cli
```

### Development / Manual Install

if for some reason, you want to develop on this and play with it,
here's a guide which shuld get you setup and functional pretty easily.

```
cd ~
mkdir bin
git clone https://github.com/zeroasterisk/sonos-simple-cli.git sonos-simple-cli-repo
ln -s sonos-simple-cli-repo/sonos.js sonos-simple-cli
cd sonos-simple-cli-repo
npm install
```

## Manual Script Running

```
$ node ~/bin/sonos.js help
-----------------------------
----- Sonos Simple CLI ------
-----------------------------
sonos-simple-cli playpause
sonos-simple-cli play
sonos-simple-cli pause
sonos-simple-cli next
sonos-simple-cli prev
sonos-simple-cli volup
sonos-simple-cli voldown
sonos-simple-cli mute
sonos-simple-cli unmute
sonos-simple-cli mutetoggle
sonos-simple-cli clearCache
-----------------------------

$ ~/bin/sonos-simple-cli playpause
  > SONOS set to PAUSED
  Beastie Boys "I Don't Know"
    @ 58/180 sec
```

## Configure for Alfred

Install [Alfred](http://www.alfredapp.com/) *if not already installed*.

To get the workflow, just double-click on `sonos-simple-cli.alfredworkflow` and
install it.

> You will recognise Alfred workflows by their .alfredworkflow file extension and their icon.
>
> To install a workflow, simply double-click the workflow file on your Mac. Alfred will show you a preview of the name and description of the workflow as well as the details for the developer, if available. Click the "Import" button to add the workflow to the sidebar on the left.

http://support.alfredapp.com/workflows:installing/

* CMD+F7 -> prev
* CMD+F8 -> play/pause
* CMD+F9 -> next
* CMD+F10 -> mutetoggle
* CMD+F11 -> volume down
* CMD+F12 -> volume up

### Manual Setup in Alfred

*here's how I created the Alfred Worflow*

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
