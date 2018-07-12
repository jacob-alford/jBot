const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');

let globalMessage; //Global Variable containing message contents
let oceanman = "OCEAN MAN 🌊 😍 Take me by the hand ✋ lead me to the land that you understand 🙌 🌊 OCEAN MAN 🌊 😍 The voyage 🚲 to the corner of the 🌎 globe is a real trip 👌 🌊 OCEAN MAN 🌊 😍 The crust of a tan man 👳 imbibed by the sand 👍 Soaking up the 💦 thirst of the land 💯";

let users = require("./users.json"); //Connect to the users JSON file
//------------Support Functions-------------------------

//------------Command Constructors---------------------------
//Used when instanciating a new command.  Call commands["name"] = new commandConstructor(...); with the appropriate arguments filled in according to the below:
//fn (function) -> The function to be run when the command is called
//desc (string) -> a user-friendly description displayed when help is called
//cat (string) -> the category to be organized under when help is called
//argCount (number) -> the number of arguments expected for the function to run.
//perms (number between 0 and 10) - > the required permissions level to execute the command
//Options (object) -> Used for several things like [command]-help construction, see below for structure [OPTIONAL]
/* options = {
							args:["args1 friendly name":"args1 description", ... ,"argsN friendly name":"argsN description"],
							cmdName:"name" //Used when declaring an interactive function such that the anonymous function has a name
							interactive:true/false //Used when declaring an interactive function.  Must be paired with a cmdName.
						}*/
function commandConstructor(fn,desc,cat,argCount,perms,options){
	if(!(options===undefined)){
		if(options.interactive){
			this.cmdName = options.cmdName;
		}
	}
	this.execute = fn;
	this.description = desc;
	this.category = cat;
	this.argsCount = argCount;
	this.interactive = false; //Will become true if the interactive command constructor is called.
	this.permissionsLevel = perms;
	if(!(options===undefined)){
		this.args = options.args;
	}
	let unique = true;
	for(i=0;i<commandCategories.length;i++){
		if(commandCategories[i] == cat){
			unique = false;
		}
	}
	if((unique) && (cat != "N/A") && (cat != "int")){
		commandCategories.push(cat);
	}
	if(!(cat=="int")){ //Avoids creating a help command for subcommands in interactive primary commands.
		if(options === undefined){
				helpConstructor(this);
			}else{
				helpConstructor(this,options);
			}
	}
}

//This constructs the [cmd]-help command.
//This should only be called if the function was manually created in the commands object.
//The helpConstructor is called automatically in commandConstructor.
function helpConstructor(name,options){
	if(!(options === undefined)){ //Options specified
		if(!(options.cmdName === undefined)){ //If a name is given
			name = options.cmdName;
		}
	}
	commands[name + "-help"] = {
		execute:function(args){
			let output = "";
			output += "Proper Usage: `" + name + "` ";
			if(!(commands[name].args === undefined)){
				for(args in commands[name].args){
					output += "`" + commands[name].args[args].name + "` ";
				}
				output += "\n";
				for(argu in commands[name].args){
					output += "__" + commands[name].args[argu].name + ":__ " + commands[name].args[argu].desc + "\n";
				}
			}
			globalMessage.channel.send(output);
		},
		argsCount:0,
		interactive: false,
		permissionsLevel: 0
}
}

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
function interactiveCommand(cmd,options){

	this.execute = (args) => {
		globalMessage.channel.send("*You are now in interactive mode!*\nUse 'help' for more information, and 'exit' to escape back to primary commands.");
		users[globalMessage.author.username].interactiveMode = true;
		users[globalMessage.author.username].currentCommand = cmd.cmdName;
	}
	this.description = cmd.description;
	this.category = cmd.category;
	this.argsCount = 0; //Arguments are handled in the subroutine declaration
	this.interactive = true;
	this.permissionsLevel = cmd.permissionsLevel;
	if(!(cmd.args===undefined)){
		this.args = cmd.args;
	}
	this.commands = {};
	for(subProperty in options){
		this.commands[subProperty] = options[subProperty];
	}

	this.commands["exit"] = new commandConstructor(function(args){
		globalMessage.channel.send("*You are no longer in interactive mode!*");
		users[globalMessage.author.username].interactiveMode = false;
	},`Exits '${this}', and returns to primary commands.`,"int",0,0);

	this.commands["help"] = new commandConstructor(function(args){
		let output = `You are currently in interactive mode.  The available options for '${cmd.cmdName}' are:\n`;
			for(cmds in users[globalMessage.author.username].interactiveCommands[users[globalMessage.author.username].currentCommand].commands){
				if(!(cmds.includes("help")) && !(users[globalMessage.author.username].interactiveCommands[users[globalMessage.author.username].currentCommand].commands[cmds].execute === undefined)){
					output += "[" + users[globalMessage.author.username].interactiveCommands[users[globalMessage.author.username].currentCommand].commands[cmds].permissionsLevel + "]`" + cmds + "` " + users[globalMessage.author.username].interactiveCommands[users[globalMessage.author.username].currentCommand].commands[cmds].description + "\n";
				}
		}
		globalMessage.channel.send(output);
	},"Lists every available command in subroutine!","int",0,0);
}

//------------Core Command Structure Samples, use command["name"] = new commandConstructor(...) to create a new command---------------
let commandCategories = ["Utility","Fun"]; //Used with the help command to sort and categorize the entries

let commands = {
	"oceanman":{
		execute:args => globalMessage.channel.send(oceanman),
		description:"OCEAN MAN",
		category:"Fun",
		argsCount:0,
		interactive:false,
		permissionsLevel:0
	},
	"oceanman-help":{
		execute: args => globalMessage.channel.send("You really want help with this?"),
		argsCount:0,
		interactive:false,
		permissionsLevel:0
	},
	"help":{
		execute:args => {
			let output = "**The following is a list of my commands:**\n";
			let cat = commandCategories.sort();
			for(categories in cat){
				output += "__" + cat[categories] + "__\n";
				for(cmd in commands){
					if((commands[cmd].category == cat[categories]) && !(cmd.includes("help"))){
						output += "[" + commands[cmd].permissionsLevel + "]`" + cmd + "` " + commands[cmd].description + "\n";
					}
				}
				output += "\n";
			}
			globalMessage.channel.send(output);
		},
		description:"Lists every command I can execute!",
		category:"Utility",
		argsCount:0,
		interactive:false,
		permissionsLevel:0
	},
	"add":{
		execute: args => globalMessage.channel.send(Number(args[0]) + Number(args[1])),
		description: "Adds two numbers together.",
		category:"Utility",
		argsCount:2,
		interactive:false,
		permissionsLevel:0,
		args:{"args1":{name:"First Number",desc:"The first number to be added."},"args2":{name:"Second Number",desc:"The second number to be added."}}
	}
}
//-----------------Command Declaration Examples---------------------
//Example of a help function being called for "add" Note: The command constructor already calls helpConstructor.  It is highly recommended to just call the commandConstructor.
helpConstructor("add");

//Example of a new command being added (see constructor above for information on the arguments)
commands["chocoTaco"] = new commandConstructor(args => globalMessage.channel.send("http://twitch.tv/chocoTaco"),"chocoTaco's Twitch Channel!","Fun",0,0,{cmdName:"chocoTaco"});
commands["rnd"] = new commandConstructor(args => globalMessage.channel.send(Math.random() * args[0]),"Returns a random number between 0 and argument specified.","Utility",1,0,{args:{"args1":{name:"Max Number","desc":"The highest number that the random function will return."}},cmdName:"rnd"});
commands["perms"] = new commandConstructor(args => globalMessage.channel.send(`You have permissions level: ${users[globalMessage.author.username].permissionLevel}`),"Returns the internal permissions level of the user.","Administrative",0,0,{cmdName:"perms"});
commands["changePerms"] = new commandConstructor(args => {
	if(users[args[0]] === undefined){
		globalMessage.channel.send("User does not exist!");
	}else{
		if(isNaN(Number(args[1]))){
			globalMessage.channel.send("Expected a number for the second argument!");
			eval(commands[changePerms-help].execute(args));
		}else{
			users[args[0]].permissionLevel = Number(args[1]);
			globalMessage.channel.send(`Changed ${args[0]}'s permission level to ${args[1]}`);
		}
	}
},"Changes the permissions of user specified in argument.","Administrative",2,10,{args:{"args1":{name:"Discord Username", desc:"A user's discord username"},"args2":{name:"Permission Level",desc:"A number between 0 and 10.  10 is usually super-admin."}},cmdName:"changePerms"});

//Example of a new interactive command being added:
commands["remember"] = new interactiveCommand(new commandConstructor(args => args,"You can store anything in here!","Utility",1,0,{cmdName:"remember",interactive:true}),{//With interactive commands, the function placed in this constructor doesn't matter
	"memory":[],
	"write":new commandConstructor(args => {
		users[globalMessage.author.username].interactiveCommands[users[globalMessage.author.username].currentCommand].commands.memory = users[globalMessage.author.username].interactiveCommands[users[globalMessage.author.username].currentCommand].commands.memory.concat(args);
		users[globalMessage.author.username].interactiveCommands[users[globalMessage.author.username].currentCommand].commands.readout.execute(args);
	},"Pushes entry into the closest memory slot.","int",1,0),
	"readout":new commandConstructor(args => {
		let output = "";
		for(i=0;i<users[globalMessage.author.username].interactiveCommands[users[globalMessage.author.username].currentCommand].commands.memory.length;i++){
			output += `[${i}]: ${users[globalMessage.author.username].interactiveCommands[users[globalMessage.author.username].currentCommand].commands.memory[i]}\n`;
		}
		if(!(output === "")){
			globalMessage.channel.send(output);
		}else{
			globalMessage.channel.send("Memory is blank!");
		}
	},"Posts what's stored in memory.","int",0,0),
	"clear":new commandConstructor(args => {
		users[globalMessage.author.username].interactiveCommands[users[globalMessage.author.username].currentCommand].commands.memory = [];
		globalMessage.channel.send("Memory cleared!");
	},"Clears user memory for the 'remember' command.","int",0,0)
});

//-----------------The bot's name, and version number (if applicable)------------------
var meta = {
	"botname":"jBot",
	"version":"1.0"
}

for(user in users){
	users[user].interactiveCheck = false;
}

//------------DiscordBot's Core Execution---------------------
bot.on('message', (message)=>{
	globalMessage = message;
	let command = message.content.split(" ");
	let args = [];

	for(i=2;i<command.length;i++){
		args[i-2] = command[i];
	}

	if(command[0] == meta.botname){
		if(users[globalMessage.author.username] === undefined){ //If the current user of the bot is not in the users.json file, this will add them with default permissions (0)
			users[globalMessage.author.username] = {
				"permissionLevel":0,
				"id":globalMessage.author.discriminator,
				"interactiveMode":false,
				"interactiveCheck":false
			}
		}

		if(users[globalMessage.author.username].interactiveMode && !users[globalMessage.author.username].interactiveCheck){ //Assign the user their own copy of interactive functions.  This allows each interactive user their own slice of memory.
			users[globalMessage.author.username].interactiveCheck = true; //Ensures user only gets assigned commands once.  Will run on startup.
			users[globalMessage.author.username].interactiveCommands = {};
			for(fn in commands){
				if(commands[fn].interactive){
					users[globalMessage.author.username].interactiveCommands[fn] = commands[fn];
				}
			}
		}

		if(!(users[globalMessage.author.username].interactiveMode)){ //If the user is in primary operations mode
			if(commands[command[1]] === undefined){ //Unrecognized command
				globalMessage.channel.send(`Unrecognized command: '${command[1]}'`);
			}else{
				if(users[globalMessage.author.username].permissionLevel >= commands[command[1]].permissionsLevel){ //If the user has sufficient permissions
					if(args.length != commands[command[1]].argsCount){ //If the arguments are of the proper number
						globalMessage.channel.send('Wrong number of arguments for "' + command[1] + '."');
						eval(commands[command[1] + "-help"].execute(args));
					}else{
						eval(commands[command[1]].execute(args));
					}
				}else{
					globalMessage.channel.send(`You don't have sufficient permissions to execute ${command[1]}`);
				}
			}
		}else{
			if(users[globalMessage.author.username].interactiveCommands[users[globalMessage.author.username].currentCommand].commands[command[1]] === undefined){ //If the interactive command in current command is undefined
				globalMessage.channel.send(`Unrecognized command: '${command[1]} in ${users[globalMessage.author.username].currentCommand}.'`);
			}else{
				if(users[globalMessage.author.username].permissionLevel >= users[globalMessage.author.username].interactiveCommands[users[globalMessage.author.username].currentCommand].commands[command[1]].permissionsLevel){ //If the user has sufficient interactive permissions
					if(args.length != users[globalMessage.author.username].interactiveCommands[users[globalMessage.author.username].currentCommand].commands[command[1]].argsCount){ //If the arguments are of the proper number
						globalMessage.channel.send("Wrong number of arguments for " + command[1] + ".");
					}else{
						eval(users[globalMessage.author.username].interactiveCommands[users[globalMessage.author.username].currentCommand].commands[command[1]].execute(args));
					}
				}
			}
		}
	}
	fs.writeFile('users.json', JSON.stringify(users), err => {if(err) throw err});
	});


bot.on('error', console.error);
bot.login('-BOT-Token-GOES-HERE-');
