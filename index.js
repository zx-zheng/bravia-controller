const bravia = require('./lib');

const RtmClient = require('@slack/client').RtmClient;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const bot_token = process.env.SLACK_BOT_TOKEN || '';
const bravia_ip = process.env.BRAVIA_IP || '';
const bravia_psk = process.env.BRAVIA_PSK || '';


let rtm = new RtmClient(bot_token);

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}`);
});

/* Available commands
PowerOn, hdmi1, hdmi2, hdmi3, hdmi4, Num1, Num2, Num3, Num4, Num5, Num6, Num7, Num8, Num9, Num0, Num11, Num12, Enter, GGuide, ChannelUp, ChannelDown, VolumeUp, VolumeDown, Mute, TvPower, Audio, MediaAudioTrack, Tv, Input, TvInput, TvAntennaCable, WakeUp, PowerOff, Sleep, Right, Left, SleepTimer, Analog2, TvAnalog, Display, Jump, PicOff, PictureOff, Teletext, Video1, Video2, AnalogRgb1, Home, Exit, PictureMode, Confirm, Up, Down, ClosedCaption, Component1, Component2, Wide, EPG, PAP, TenKey, BSCS, Ddata, Stop, Pause, Play, Rewind, Forward, DOT, Rec, Return, Blue, Red, Green, Yellow, SubTitle, CS, BS, Digital, Options, Media, Prev, Next, DpadCenter, CursorUp, CursorDown, CursorLeft, CursorRight, ShopRemoteControlForcedDynamic, FlashPlus, FlashMinus, AudioQualityMode, DemoMode, Analog, Mode3D, DigitalToggle, DemoSurround, *AD, AudioMixUp, AudioMixDown, PhotoFrame, Tv_Radio, SyncMenu, Hdmi1, Hdmi2, Hdmi3, Hdmi4, TopMenu, PopUpMenu, OneTouchTimeRec, OneTouchView, DUX, FootballMode, iManual, Netflix, Assists, FeaturedApp, FeaturedAppVOD, GooglePlay, ActionMenu, Help, TvSatellite, WirelessSubwoofer
*/

rtm.on(RTM_EVENTS.MESSAGE, (message) => {
    text = message.text || message.attachments[0].pretext || '';
    console.log(text);
    cmds = text.split(',');
    switch (cmds[0]) {
    case 'bravia':
        bravia(bravia_ip, bravia_psk, (client) => {
            operate_bravia(client, cmds.slice(1))
        });
        break;
    }
});

rtm.start();

const operate_bravia = (client, ops) => {
    op = ops[0].replace(/\s+/g, '')
    num = ops[1]
    switch (true) {
    case /起動|つけて/.test(op):
        console.log('wake up bravia');
        client.exec('WakeUp');
        break;
    case /テレビ/.test(op):
        console.log('wake up and tv bravia');
        client.exec('WakeUp');
        client.exec('Tv');
        break;
    case /チャンネル/.test(op):
        client.exec('WakeUp');
        client.exec('Tv');
        if (num) {
            console.log('change tv channel to ' + num);
            client.exec('Num' + num);
        }
        break;
    case /一時停止/.test(op):
        client.exec('Pause');
        break;
    case /再生/.test(op):
        client.exec('Play');
        break;
    case /入力/.test(op):
        client.exec('WakeUp');
        if (num) {
            console.log('change input to HDMI ' + num);
            client.exec('Hdmi' + num);
        } else if (/BS/.test(op)) {
            client.exec('BS');
        } else if (/地上波/.test(op)) {
            client.exec('Digital');
        }
        break;
    case /終了|消して/.test(op):
        console.log('power off bravia');
        client.exec('PowerOff');
        break;
    }    
};
