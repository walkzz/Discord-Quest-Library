
# Orb Automator

A lightweight application that allows you to launch an executable for any game. It fools Discord into thinking the game is active, letting you earn Discord orbs or customize your active status without wasting CPU or RAM on running the actual game.


## Features

- Lightweight Background Process: Minimal CPU and memory usage.
- Standalone Output: Once launched, it stays in the background, allowing you to do other tasks without the need to spend 15 minutes stuck in-game.
- UI Design: Comes with a clean user interface, making it easy to select which game you want to start a quest for.


## Step-by-Step Setup

1. Download the release version: go to the Releases page, navigate to Assets at the bottom, and download the latest release.
2. Download both `Quest-Launcher.exe` and `discord-executables.txt`.
3. Create a folder and place them in the same folder.
4. Run the application
- _(A Windows security screen may pop up saying "Windows protected your PC" or "Microsoft Defender SmartScreen prevented an unrecognized app from starting". Click on More info and then click Run anyway.)_
    
## Step-by-Step with Screenshots

1. Download the latest files from *Releases* section:
<img width="324" height="134" alt="Screenshot 2026-06-30 020840" src="https://github.com/user-attachments/assets/990f4634-e03c-4585-8d34-baeabd5d82e4" />
<br>
2. Make a folder and put the 2 files you downloaded in the same folder.
<img width="659" height="236" alt="Screenshot 2026-06-30 223459" src="https://github.com/user-attachments/assets/7bf0e39d-6814-40d2-b553-65c422e68fe9" />
<br>
3. Run the application and active any quest you want to do in your current Discord's Orbs section, inside the application run any application (<em>In this case, I already activated it for Delta Force using Legacy Mode.)</em>
<br>
<img width="350" height="317" alt="Screenshot 2026-06-30 223948" src="https://github.com/user-attachments/assets/cf3d0502-53ad-46f4-a759-20c462a64c97" />
<br>
<img width="538" height="389" alt="Screenshot 2026-06-30 223744" src="https://github.com/user-attachments/assets/6bf682b4-500f-4f0f-8e32-1407a83d1059" />
<br>
4. Once the quest is completed you can safely terminate the command prompt(CMD) or exit the application altogether.
<img width="526" height="165" alt="Screenshot 2026-06-30 224335" src="https://github.com/user-attachments/assets/76ada328-6183-40d4-8026-e679a9d565ed" />


## Troubleshooting

#### Error: "running scripts is disabled on this system"Error: "running scripts is disabled on this system"

First, be sure you have the latest version of Node.js installed on your system.
* **Node.js (LTS version recommended):** [Download Node.js](https://nodejs.org/)

If you see a red error in PowerShell when typing `npm install`, copy and paste this command into PowerShell, hit **Enter**, and try again:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
If it asks for confirmation, type Y and press Enter. Run `npm install` again.
## FAQ

#### Will I get banned for using this service?

Technically, no. You might get rate-limited, which lasts for one or two days, but as of recently, this behavior isn't showing up as much.

#### How many times can I use this program to earn orbs in a day?

It is advised not to go over 3 times per day. Discord will rate-limit you and you will have to wait a day or two for it to reset.

#### Can I use my earned orbs to gift my friends, especially items from their wishlist?

No, you cannot gift orbs to your friends. However, you can share this application with them so they can earn their own!

#### Is this service free?

The service is completely open-source and free. I do not need your well-earned money.


## Disclaimer

This utility is strictly for educational and personal use. I do not endorse or enforce spamming behavior or the use of other scripts beyond this program. Use this program at your own risk; you can stop and delete it at any time.
