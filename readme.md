# <img src="https://file.strassburger.org/discordCustomRPlogoPng.png" height="30px"> Discord Custom RP Plus

Discord Custom RP Plus is a Discord Rich Presence Manager for Windows and MacOS.

This app is heavily inspired by [customrp.xyz](https://www.customrp.xyz/), but introduces more features like a nicer GUI and a preview.

## Download and Setup

You can find a setup guide on the [website](https://tools.strassburger.org/discordrp)

### Windows

1. Download the latest version from the [Releases Page](https://github.com/KartoffelChipss/discord-rp/releases)
2. Follow the instructions in the installer
3. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and create an application
4. Copy the Application ID and paste it into the "Application ID" filed in Discord Custom RP Plus
5. Click "Connect"
6. If the Application ID field is green, you can fill in your details and click "Update Activity"
7. Enjoy you custom rich presence :D

## Building your own installer

You can run the app with

```powershell
npm run start
```

If you want to build your own installer, you can use

```powershell
npm run build-installer 
```
