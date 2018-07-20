# jBot
A generic DiscordBot structure with simple command creation.  Automatically creates help, [cmd]-help, and checks both permissions and argument validity.  Allows nested command structures in a feature called "interactive" commands.  Allows the user to access a set of commands that's isolated from primary commands.  An interactive command could look something like a game of tic tac toe.
Uses Node to compile javascript.  Requires discord.js.

## Master Branch
As opposed to the 'Samples' branch which contains several sample commands, the master branch contains only the "help" command.

## Steps to deployment:
* Install node
* Install discord.js using npm
* Create a discord app in discord developer "My Apps" section
* Download project files
* Plug in your Discord Bot's Token Key
* Invite "my apps" Discord Bot to discord channel (must be administrator)
* Assign appropriate roles
* Use command prompt or terminal to run the node index.js file.

## Command Declaration Reference
The following is a reference for creating your own commands using the built-in command constructor!
### Primary Command Constructor
#### Calling a new primary command
```commands["*New Command Name*"] = new commandConstructor({options});```
#### Options' Properties and Description
##### (?) denotes an optional declaration
Property Name |Description |Type | Default Value
------------ | -------------
cmdName | A repeat of the name given to the command, used to create the help command. | String |
execute | The function called when the command is executed.  Normally contains ```globalMessage.channel.send(...);``` | Function |
description | The friendly description for the command displayed with the built-in help command. | String |
category | The friendly category of the command displayed with the built-in help command. | String |
argsCount **(?)** | The number of arguments expected when the command is called. | Number | 0
argsEnforced **(?)** | Whether or not the command will require the exact number of arguments in order to execute. | Boolean | False
args **(?)** | The friendly names and descriptions of every available argument. | Object |
permissionsLevel **(?)** | The required internal permissions level for a command to be executed.  References the users in users.json. | Number | 0
disabled **(?)** | Whether or not the function will executed if called. | boolean | false
