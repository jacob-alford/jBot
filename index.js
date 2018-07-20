const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');
let globalMessage; //Global Variable containing message contents
let users = require("./users.json"); //Connect to the users JSON file
let oceanman = "OCEAN MAN 🌊 😍 Take me by the hand ✋ lead me to the land that you understand 🙌 🌊 OCEAN MAN 🌊 😍 The voyage 🚲 to the corner of the 🌎 globe is a real trip 👌 🌊 OCEAN MAN 🌊 😍 The crust of a tan man 👳 imbibed by the sand 👍 Soaking up the 💦 thirst of the land 💯";


//------------Support Functions-------------------------

//------------Command Constructors---------------------------
//Used when instanciating a new command.  Call commands["name"] = new commandConstructor(...); with the appropriate arguments filled in according to the below:
//See GitHub for proper usage
function commandConstructor(options){
	if(!(options.cmdName === undefined) && (typeof options.cmdName == "string")){
		this.cmdName = options.cmdName;
	}else{
		console.error(`Error when delcaring new command ${this}, missing or wrong type for cmdName!`);
	}
	if(!(options.execute === undefined) && (typeof options.execute == "function")){
		this.execute = options.execute;
	}else{
		console.error(`Error when delcaring new command ${this}, missing or wrong type for execute!`);
	}
	if(!(options.description === undefined) && (typeof options.description == "string")){
		this.description = options.description;
	}else{
		console.error(`Error when delcaring new command ${this}, missing or wrong type for description!`);
	}
	if(!(options.category === undefined) && (typeof options.category == "string")){
		this.category = options.category;
	}else{
		console.error(`Error when delcaring new command ${this}, missing or wrong type for category!`);
	}
	if(!(options.argsCount === undefined) && (!isNaN(options.argsCount))){
		this.argsCount = options.argsCount;
	}else{
		this.argsCount = 0;
	}
	if(!(options.permissionsLevel === undefined) && (!isNaN(options.permissionsLevel))){
		this.permissionsLevel = options.permissionsLevel;
	}else{
		this.permissionsLevel = 0;
	}
	if(!(options.args === undefined) && (typeof options.args == "object")){
		this.args = options.args;
	}
	if(!(options.argsEnforced === undefined) && (typeof options.argsEnforced == "boolean")){
		this.argsEnforced = options.argsEnforced;
	}else{
			if(options.argsCount > 0){
				this.argsEnforced = true; //If there are arguments
			}else{
				this.argsEnforced = false; //If there aren't arguments
			}
		}
	this.interactive = false; //Will become true if the interactive command constructor is called.
	if(!(options.disabled === undefined) && (typeof options.disabled == "boolean")){
		this.disabled = options.disabled;
	}else{
		this.disabled = false;
	}
	let unique = true;
	for(i=0;i<commandCategories.length;i++){
		if(commandCategories[i] == options.category){
			unique = false;
		}
	}
	if((unique) && (options.category != "N/A") && (options.category != "int")){
		commandCategories.push(options.category);
	}
	if(!(options.category=="int")){ //Avoids creating a help command for subcommands in interactive primary commands.
				helpConstructor(options);
	}
}

//This constructs the [cmd]-help command.
//This should only be called if the function was manually created in the commands object.
function helpConstructor(options){
	name = options.cmdName;
	commands[name + "-help"] = new commandConstructor({
		cmdName:name,
		execute:(args) => {
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
		description:"A help function",
		category:"int",
		argsEnforced:false
	});
}

//Interactive commands prevent top-level commands from being executed, and instead run their own subset of commands.
//See GitHub for proper usage
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
	this.commands["exit"] = new commandConstructor({
		cmdName:"exit",
		execute:(args) => {
			globalMessage.channel.send("*You are no longer in interactive mode!*");
			users[globalMessage.author.username].interactiveMode = false;
		},
		description:`Exits '${this}', and returns to primary commands.`,
		category:"int",
		argsEnforced:false
	});
	this.commands["help"] = new commandConstructor({
		cmdName:"help",
		execute:(args) => {
			let output = `You are currently in interactive mode.  The available options for '${cmd.cmdName}' are:\n`;
				for(cmds in users[globalMessage.author.username].interactiveCommands[users[globalMessage.author.username].currentCommand].commands){
					if(!(cmds.includes("help")) && !(users[globalMessage.author.username].interactiveCommands[users[globalMessage.author.username].currentCommand].commands[cmds].execute === undefined)){
						output += "[" + users[globalMessage.author.username].interactiveCommands[users[globalMessage.author.username].currentCommand].commands[cmds].permissionsLevel + "]`" + cmds + "` " + users[globalMessage.author.username].interactiveCommands[users[globalMessage.author.username].currentCommand].commands[cmds].description + "\n";
					}
			}
			globalMessage.channel.send(output);
		},
		description:`Lists every available command in subroutine!`,
		category:"int",
		argsEnforced:false
	});

}

//------------Core Command Structure Samples, use command["name"] = new commandConstructor(...) to create a new command---------------
let commandCategories = []; //Used with the help command to sort and categorize the entries

let commands = {
	"help":{
		execute:args => {
			let output = "**The following is a list of my commands:**\n";
			let cat = commandCategories.sort();
			for(categories in cat){
				output += "__" + cat[categories] + "__\n";
				for(cmd in commands){
					if(commands[cmd].disabled){
						if((commands[cmd].category == cat[categories]) && !(cmd.includes("help"))){
							output += "~~[" + commands[cmd].permissionsLevel + "]" + cmd + " " + commands[cmd].description + "~~\n";
						}
					}else{
						if((commands[cmd].category == cat[categories]) && !(cmd.includes("help"))){
							output += "[" + commands[cmd].permissionsLevel + "]`" + cmd + "` " + commands[cmd].description + "\n";
						}
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
		argsEnforced:false,
		permissionsLevel:0
	}
}
//-----------------Command Declaration---------------------
commands["oceanman"] = new commandConstructor({
	cmdName:"oceanman",
	execute:args => globalMessage.channel.send(oceanman),
	description:`OCEANMAN`,
	category:"Fun",
	argsEnforced:false
});
commands["rnd"] = new commandConstructor({
	cmdName:"rnd",
	execute:args => globalMessage.channel.send(Math.floor((Math.random() * args[0]))),
	description:'Returns a random number between 0 and argument specified.',
	category:"Utility",
	argsCount:1,
	args:{"args1":{name:"Max Number","desc":"The highest number that the random function will return."}}
});
commands["perms"] = new commandConstructor({
	cmdName:"perms",
	execute:args => globalMessage.channel.send(`You have permissions level: ${users[globalMessage.author.username].permissionLevel}`),
	description:"Returns the internal permissions level of the user.",
	category:"Administrative",
	argsCount:0
});
commands["changePerms"] = new commandConstructor({
	cmdName:"changePerms",
	execute:input => {
		let temp = input.split(" ");
		console.log(temp);
		let temp2 = "";
		let args = [];
		for(let c=0;c<temp.length-2;c++){ //This is weird code to handle Discord usernames with spaces.
			console.log(c); 								//This is necessary only when argsEnforced is false.
			if(c==temp.length-3){						//Useful for commands like this one or for commands like [bot] say (...)
				temp2 += temp[c];
			}else{
				temp2 += temp[c] + " ";
			}
		}
		console.log(temp2);
		args[0] = temp2;
		args[1] = temp[temp.length-2];
		console.log(args);
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
	},
	description:"Changes the permissions of user specified in argument.",
	category:"Administrative",
	argsCount:2,
	permissionsLevel:10,
	argsEnforced:false,
	args:{"args1":{name:"Discord Username", desc:"A user's discord username"},"args2":{name:"Permission Level",desc:"A number between 0 and 10.  10 is usually super-admin."}},
	disabled:true
});


//-----------------The bot's name, and version number (if applicable)------------------
var meta = {
	"botname":"jBot", //Used as the qualifying command.  The bot will activate if this botname is called.
	"version":"1.0"
}

//------------DiscordBot's Core Execution---------------------
for(user in users){
	users[user].interactiveCheck = false;
}

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
				if(!commands[command[1]].argsEnforced){
					let temp = "";
					for(let c=0;c<args.length;c++){
						temp+=args[c] + " ";
					}
					args = temp;
				}
				if(!(commands[command[1]].disabled)){
						if(users[globalMessage.author.username].permissionLevel >= commands[command[1]].permissionsLevel){ //If the user has sufficient permissions
						if((args.length != commands[command[1]].argsCount) && commands[command[1]].argsEnforced){ //If the arguments are of the proper number
							globalMessage.channel.send('Wrong number of arguments for "' + command[1] + '."');
							eval(commands[command[1] + "-help"].execute(args));
						}else{
							eval(commands[command[1]].execute(args));
						}
					}else{
						globalMessage.channel.send(`You don't have sufficient permissions to execute ${command[1]}`);
					}
				}else{
					globalMessage.channel.send(`${command[1]} has been disabled.`);
				}
			}
		}else{
			if(users[globalMessage.author.username].interactiveCommands[users[globalMessage.author.username].currentCommand].commands[command[1]] === undefined){ //If the interactive command in current command is undefined
				globalMessage.channel.send(`Unrecognized command: '${command[1]} in ${users[globalMessage.author.username].currentCommand}.'`);
			}else{
				if(users[globalMessage.author.username].permissionLevel >= users[globalMessage.author.username].interactiveCommands[users[globalMessage.author.username].currentCommand].commands[command[1]].permissionsLevel){ //If the user has sufficient interactive permissions
					if((args.length != users[globalMessage.author.username].interactiveCommands[users[globalMessage.author.username].currentCommand].commands[command[1]].argsCount) && (args.length != users[globalMessage.author.username].interactiveCommands[users[globalMessage.author.username].currentCommand].commands[command[1]].argsEnforced)){ //If the arguments are of the proper number
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
bot.login('--BOT LOGIN TOKEN GOES HERE--');
