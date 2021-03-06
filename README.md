# jBot
A generic DiscordBot structure with simple command creation.  Automatically creates help, [cmd]-help, and checks both permissions and argument validity.  Allows nested command structures in a feature called "interactive" commands.  Allows the user to access a set of commands that's isolated from primary commands.  An interactive command could look something like a game of tic tac toe.
Uses Node to compile javascript.  Requires discord.js.

## Master Branch
Contains the raw code, without any sample commands.  Use the examples below to write your first command!

## Samples Branch
Conatains several sample commands for you to reference and test.

## My Implementation Branch
My personal implementation of jBot.  Contains several versatile functions that are listed in the readme in that branch.

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
#### Options' Properties and Descriptions
##### (?) denotes an optional declaration
Property Name | Description | Type | Required/Default Value
------------ | ------------- | ------------- | -------------
cmdName | A repeat of the name given to the command, used to create the help command. | String | Required
execute | The function called when the command is executed.  Normally contains ```globalMessage.channel.send(...);``` | Function | Required
description | The friendly description for the command displayed with the built-in help command. | String | Required
category | The friendly category of the command displayed with the built-in help command. | String | Required
argsCount | The number of arguments expected when the command is called. | Number | **(?)** 0
argsEnforced | Whether or not the command will require the exact number of arguments in order to execute. | Boolean | **(?)** False
args | The friendly names and descriptions of every available argument. | Object |  **(?)** undefined
permissionsLevel | The required internal permissions level for a command to be executed.  References the users in users.json. | Number | **(?)** 0
disabled | Whether or not the function will execute if called. | boolean | **(?)** false
#### Example
```
commands["oceanman"] = new commandConstructor({
	cmdName:"oceanman",
	execute:args => globalMessage.channel.send(oceanman),
	description:`OCEANMAN`,
	category:"Fun",
	argsEnforced:false
});
```
### Interactive Command Constructor
#### Calling a new interactive command
```commands["*New Interactive Command Name*"] = new interactiveCommand({initial command},{captive commands});```
##### Initial Command
Use ```commands["*New Interactive Command Name*"] = new commandConstructor({options});``` for this argument, specifying *int* for category for purposes of the built-in 'help' command.
##### Captive Command
This argument takes an object, which contains at least one function (or else the command *should* be a primary command), and also may contain any other property.
#### Example
The following omits the subcommands for brevity.  They will act as regular commands, and require that *int* be specified in category delcaration.
```
commands["remember"] = new interactiveCommand(new commandConstructor({
	cmdName:"remember",
	execute:args => args, //Note, this execute will never be called.  A default execute is assigned.
	description:`An interactive command that stores something in memory!`,
	category:"Utility",
	argsEnforced:false
}),{
	"memory":[],
	"write":new commandConstructor(...),
	"readout":new commandConstructor(...),
	"clear":new commandConstructor(...)
});
```
