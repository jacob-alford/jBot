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

## Argument Guide
```
Includes three command constructors:
-commandConstructor() <- used to create a vanilla command.
-interactiveCommands() <- used to create a command which will only execute subroutines defined in the constructor declaration.
-helpConstructor() <- automatically called in commandConstructor to create an additional [cmd]-help command.

Arguments for the commandConstructor():
//Used when instanciating a new command.  Call commands["name"] = new commandConstructor(...); with appropriate arguments:
//fn (function) -> The function to be run when the command is called
//desc (string) -> a user-friendly description displayed when help is called
//cat (string) -> the category to be organized under when help is called
//argCount (number) -> the number of arguments expected for the function to run.
//perms (number between 0 and 10) - > the required permissions level to execute the command
//Options (object) -> Used for several things like [command]-help construction, see below for structure [OPTIONAL].  
//Interactive is not optional when declaring an interactive command using this constructor.  
//Must use "int" as command category when declaring subroutines within interactive commands.
/* options = {
		args:["args1 friendly name":"args1 description", ... ,"argsN friendly name":"argsN description"],
		cmdName:"name" //Used when declaring an interactive function such that the anonymous function has a name
		interactive:true/false //Used when declaring an interactive function.  Must be paired with a cmdName.
			}*/
            

Arguments for the interactiveCommands():
//Interactive commands prevent top-level commands from being executed, and instead run their own subset of commands.
//Interactive commands are user-specific, and can have user-specific memory. [THIS MAY BE BROKEN AS OF V1.0, RESASON UNKNOWN]
//Use command["name"] = new interactiveConstructor(options); to instanciate a new interactive command.
//Note, the mandatory 'help' and 'exit' functions will be created automatically.
//Options (object) -> used for passing every subcommand or memory unit, see below for structure.
//Note: the 'cat' category parameter MUST be set to "int" for interactive commands while using commandConstructor in subcommands.
/* options = {
		"memory":[], <- memory can take any type, but is typically used in the below functions.
		"function1Name":new commandConstructor(...), <- subroutine executed when interactive mode is active.
		"function2Name":new commandConstructor(...), <- Must pass 'int' in the category argument for subroutine declaration.
		"function3Name":new commandConstructor(...),
						...
		"functionNName":new commandConstructor(...)
				}*/
//cmd (object) -> the command to call in order to bring focus to the subset of commands.  See below for structure:
// Use cmd = new commandConstructor(); to pass in cmd.
```
