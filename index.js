const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');
let globalMessage; //Global Variable containing message contents
let users = require("./users.json"); //Connect to the users JSON file
let channels = require("./channels.json"); //Connect to the channels JSON file
let checkName = false;
let oceanman = "OCEAN MAN 🌊 😍 Take me by the hand ✋ lead me to the land that you understand 🙌 🌊 OCEAN MAN 🌊 😍 The voyage 🚲 to the corner of the 🌎 globe is a real trip 👌 🌊 OCEAN MAN 🌊 😍 The crust of a tan man 👳 imbibed by the sand 👍 Soaking up the 💦 thirst of the land 💯";
//------------Support Functions-------------------------
const rnd = (min,max) => Math.floor(Math.random()*(max-min+1))+min;

function colorObject(input,inHue,inSat,inBright){
	if(inHue === undefined || inSat === undefined || inBright === undefined){
		//Normalize inputs
		var rgb = input.split("");
		var redValue = Number("0x"+rgb[0]+rgb[1]);
		var greenValue = Number("0x"+rgb[2]+rgb[3])
		var blueValue = Number("0x"+rgb[4]+rgb[5]);
		this.hexValue = input;
		this.red=Number(redValue.toString(10))/255;
		this.green=Number(greenValue.toString(10))/255;
		this.blue=Number(blueValue.toString(10))/255;
	}else{
		var rgb = input.split("");
		var rgbArray = hslToRGB(inHue/360,inSat,inBright);
		var redValue = rgbArray[0];
		var greenValue = rgbArray[1];
		var blueValue = rgbArray[2];
		this.red=Math.round(redValue);
		this.green=Math.round(greenValue);
		this.blue=Math.round(blueValue);
		var redHex = Number(this.red).toString(16);
		var greenHex = Number(this.green).toString(16);
		var blueHex = Number(this.blue).toString(16);
		if(redHex.length==1){
			redHex="0"+redHex;
		}
		if(greenHex.length==1){
			greenHex="0"+greenHex;
		}
		if(blueHex.length==1){
			blueHex="0"+blueHex;
		}
		this.hex=redHex+greenHex+blueHex;
	}
	this.delta = Math.max(this.red,this.green,this.blue) - Math.min(this.red,this.green,this.blue);
	//--------------------HSL------------------------
	this.lightnessHSL = .5*(Math.max(this.red,this.green,this.blue)+Math.min(this.red,this.green,this.blue));
	//Saturation
	if(this.delta == 0){
		this.saturationHSL = 0;
	}else{
		this.saturationHSL = (this.delta)/(1-Math.abs(2*this.lightnessHSL-1));
	}
	//Hue
	if(this.red > this.green && this.red > this.blue){ //Red is max
		this.hueHSL = 60*(((this.green-this.blue)/this.delta)%6);
		if(this.hueHSL<0){
			this.hueHSL = this.hueHSL + 360;
		}
	}else if(this.green > this.red && this.green > this.blue){ //Green is max
		this.hueHSL = 60*(((this.blue - this.red)/this.delta)+2);
		if(this.hueHSL<0){
			this.hueHSL = this.hueHSL + 360;
		}
	}else if(this.blue > this.red && this.blue > this.green){ //Blue is max
		this.hueHSL = 60*(((this.red-this.green)/this.delta)+4);
		if(this.hueHSL<0){
			this.hueHSL = this.hueHSL + 360;
		}
	}else if(this.delta == 0){
		this.hueHSL = 0;
	}
	//--------------------HSB------------------------
	//Brightness
	this.brightnessHSB = Math.max(this.red,this.green,this.blue);
	//Saturation
	if(this.brightnessHSB == 0){
		this.saturationHSB = 0;
	}else{
		this.saturationHSB = this.delta/this.brightnessHSB;
	}
	this.hueHSB = this.hueHSL;
	//Readouts
	this.readoutHSL = function() {return "(" + Math.floor(this.hueHSL) + ", " + this.saturationHSL + ", " + this.lightnessHSL + ")";};
	this.readoutHSB = function() {return "(" + Math.floor(this.hueHSB) + ", " + this.saturationHSB + ", " + this.brightnessHSB + ")";};
	this.readoutRGB = function() {return "(" + this.red*255 + ", " + this.green*255 + ", " + this.blue*255 + ")";};
}
function commas(str) {
  return (str + "").replace(/\b(\d+)((\.\d+)*)\b/g, function(a, b, c) {
    return (b.charAt(0) > 0 && !(c || ".").lastIndexOf(".") ? b.replace(/(\d)(?=(\d{3})+$)/g, "$1,") : b) + c;
  });
}
function hslToRGB(h,s,l){
	var r,g,b;
	if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return [r * 255, g * 255, b * 255];
}
//Definition Resolve
let lookup = {
		oldbot:"https://www.dropbox.com/s/sirx26j9cdmxsf9/BotImage.jpg?dl=0",
		dndteaser: "https://www.dropbox.com/s/w2t1ffc6ylwly70/Sample_Crystal.jpg?dl=0"
		};
let currentStatus = {
		s:"STREAMING",
		p: "PLAYING",
		l: "LISTENING",
		w: "WATCHING"
		};
let memoryResolve = ["x","y"];
//------------Command Constructors---------------------------
//Used when instanciating a new command.  Call commands["name"] = new commandConstructor(...); with the appropriate arguments filled in according to the below:
//See GitHub for proper usage
function commandConstructor(options){
	if(!(options.cmdName === undefined) && (typeof options.cmdName == "string")){
		this.cmdName = options.cmdName;
	}else{
		console.error(`Error when delcaring new command, missing or wrong type for cmdName!`);
	}
	if(!(options.execute === undefined) && (typeof options.execute == "function")){
		this.execute = options.execute;
	}else{
		console.error(`Error when delcaring new command, missing or wrong type for execute!`);
	}
	if(!(options.description === undefined) && (typeof options.description == "string")){
		this.description = options.description;
	}else{
		console.error(`Error when delcaring new command, missing or wrong type for description!`);
	}
	if(!(options.category === undefined) && (typeof options.category == "string")){
		this.category = options.category;
	}else{
		console.error(`Error when delcaring new command, missing or wrong type for category!`);
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
//This should only never be called.
function helpConstructor(options){
	let name = options.cmdName;
	commands[name + "-help"] = new commandConstructor({
		cmdName:name + "-help",
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
//This constructs every subcommand-help for interactive commands.
function interactiveHelpConstruct(){
	for(int in commands){
		if(commands[int].interactive){
			for(sub in commands[int].commands){
				if(!(commands[int].commands[sub].cmdName === undefined)){
					const name = sub;
					if(!(name.includes("help"))){
							commands[int].commands[name + "-help"] = new commandConstructor({
							cmdName:name + "-help",
							execute:args => {
								let output = "";
								output += "Proper Usage: `" + name + "` ";
								if(!(commands[int].commands[name].args === undefined)){
									for(argo in commands[int].commands[name].args){
										const argumentName = commands[int].commands[name].args[argo].name;
										output += "`" + argumentName + "` ";
									}
									output += "\n";
									for(argu in commands[int].commands[name].args){
										const argumentName = commands[int].commands[name].args[argu].name;
										const argumentDesc = commands[int].commands[name].args[argu].desc;
										output += "__" + argumentName + ":__ " + argumentDesc + "\n";
									}
								}
								globalMessage.channel.send(output);
							},
							description:"A help function",
							category:"int",
							argsEnforced:false
						});
					}
				}
			}
		}
	}
}

//Interactive commands prevent top-level commands from being executed, and instead run their own subset of commands.
//See GitHub for proper usage
function interactiveCommand(cmd,options,clientSide){

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
			users[globalMessage.author.username].currentCommand = "";
			users[globalMessage.author.username].interactiveMode = false;
		},
		description:`Exits '${cmd.cmdName}', and returns to primary commands.`,
		category:"int",
		argsEnforced:false
	});
	this.commands["help"] = new commandConstructor({
		cmdName:"help",
		execute:(args) => {
			let output = `You are currently in interactive mode.  The available options for '${cmd.cmdName}' are:\n`;
				for(cmds in commands[cmd.cmdName].commands){
					if(!(cmds.includes("help")) && !(commands[cmd.cmdName].commands[cmds].execute === undefined)){
						output += "[" + commands[cmd.cmdName].commands[cmds].permissionsLevel + "]`" + cmds + "` " + commands[cmd.cmdName].commands[cmds].description + "\n";
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
commands["roll"] = new commandConstructor({
	cmdName:"roll",
	execute:args => {
		if((globalMessage.content.includes("("))&&(!globalMessage.content.includes("and"))){
			let DiceString = globalMessage.content.split(")");
			if(Number(DiceString[0].replace(/\D/g,'')) > 10){
				globalMessage.channel.send(`${Number(DiceString[0].replace(/\D/g,''))} is too many!  Try less than ten.`);
				return;
			}
			let totalDice = 0;
			let currentRoll;
			for (let i=0; i<Number(DiceString[0].replace(/\D/g,'')); i++){
				currentRoll = rnd(1, Number(DiceString[1].replace(/\D/g,'')));
				totalDice += currentRoll;
				globalMessage.channel.send("**Dice "+Number(i+1)+":** "+currentRoll);
				}
			globalMessage.channel.send("__**Total:**__ "+totalDice);
		}else if((!globalMessage.content.includes("("))&&(globalMessage.content.includes("and"))){
			let DiceString = globalMessage.content.split("and");
			let totalDice = 0;
			let i;
			let currentRoll;
			for (i=0; i<DiceString.length; i++){
				currentRoll = rnd(1, Number(DiceString[i].replace(/\D/g,'')));
				totalDice += currentRoll;
				globalMessage.channel.send("**Dice "+Number(i+1)+":** "+currentRoll);
			}
			globalMessage.channel.send("__**Total:**__ "+totalDice);
		}else if((globalMessage.content.includes("("))&&(globalMessage.content.includes("and"))){
				let DiceString = globalMessage.content.split(/[()]+/);
				for(let i=0;i<DiceString.length;i++){
					if(typeof DiceString[i] == "number") if(DiceString[i] > 10){
						globalMessage.channel.send(`${Number(DiceString[i].replace(/\D/g,''))} is too many!  Try less than ten.`);
						return;
					}
				}
				let i;
				let j;
				let currentRoll;
				let totalDice = 0;
				for(i=1;i<DiceString.length;i++){
						if(((i%2)==0)&&(Number(DiceString[i-1])<11)){
							for(j=0;j<Number(DiceString[i-1]);j++){
								currentRoll = rnd(1, Number(DiceString[i].replace(/\D/g,'')));
								totalDice += currentRoll;
								globalMessage.channel.send("**("+(i/2)+") Die "+(j+1)+":** "+currentRoll);
							}
						}
					}
				globalMessage.channel.send("__**Total:**__ "+totalDice);
		}else if((!globalMessage.content.includes("("))&&(!globalMessage.content.includes("and"))){
			let DiceString = globalMessage.content.replace(/\D/g,'');
			currentRoll = rnd(1, Number(DiceString));
			globalMessage.channel.send("__**Total:**__ "+currentRoll);

		}
	},
	description:"Rolls a number of dice, and returns the total value.",
	category:"Utility",
	argsCount:3,
	argsEnforced:false,
	args:{"args1":{name:"Quantifier", desc:"Either 'a' or a number in parenthesis '(#)'"},"args2":{name:"Die Type",desc:"'d#' can chain the command by including 'and' between quantifiers."}},
	permissionsLevel:0
});
commands["define"] = new commandConstructor({
	cmdName:"define",
	execute:args => globalMessage.channel.send("https://www.merriam-webster.com/dictionary/"+args[0]),
	description:"Defines a word by constructing a URL",
	category:"Utility",
	argsCount:1,
	argsEnforced:true,
	args:{"args1":{name:"Word", desc:"The word to be defined."}},
	permissionsLevel:0
});
commands["setname"] = new commandConstructor({
	cmdName:"setname",
	execute:args => {
		let input = args.split(" ");
		let output = "";
		for(let c=1;c<input.length;c++){
			if(c==input.length-1){
				output += input[c];
			}else{
				output += input[c] + " ";
			}
		}
		if((input[0]=="s")||(input[0]=="p")||(input[0]=="l")||(input[0]=="w")){
			setTimeout(function(){
				bot.user.setActivity(output,{type:currentStatus[input[0]]});
				globalMessage.channel.send("Set name to: "+output+".  Set status to: "+currentStatus[input[0]]);
				},1000);
		}else{
			setTimeout(function(){
				globalMessage.channel.send("Be sure to include the status properly! Resetting.");
				checkName = false;
			}, 1000);
		}
	},
	description:"Sets my name in Discord!",
	category:"Administrative",
	argsCount:2,
	argsEnforced:false,
	args:{"args1":{name:"Status", desc:"p,s,w,l - stands for playing, streaming, watching, and listening respectively."},"args2":{name:"Activity",desc:"The activity the bot is either playing, streaming, watching, or listening."}},
	permissionsLevel:8
});
commands["colorconvert"] = new commandConstructor({
	cmdName:"colorconvert",
	execute:args => {
		let colorPicked = new colorObject(args[0]);
		globalMessage.channel.send("**HSL: **" + colorPicked.readoutHSL());
		globalMessage.channel.send("**HSB: **" + colorPicked.readoutHSB());
		globalMessage.channel.send("**RGB: **" + colorPicked.readoutRGB());
	},
	description:"Converts a color hexadecimal code into RGB, HSL, and HSB.",
	category:"Utility",
	argsCount:1,
	argsEnforced:true,
	args:{"args1":{name:"Color-Code",desc:"A six digit hexadecimal color code."}},
	permissionsLevel:0
});
commands["changePerms"] = new commandConstructor({
	cmdName:"changePerms",
	execute:input => {
		let temp = input.split(" ");
		let temp2 = "";
		let args = [];
		for(let c=0;c<temp.length-2;c++){ //This is weird code to handle Discord usernames with spaces.
			if(c==temp.length-3){						//Useful for commands like this one or for commands like [bot] say (...)
				temp2 += temp[c];
			}else{
				temp2 += temp[c] + " ";
			}
		}
		args[0] = temp2;
		args[1] = temp[temp.length-2];
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
	disabled:false
});
commands["perms"] = new commandConstructor({
	cmdName:"perms",
	execute:args => {
		if(args === ""){
			globalMessage.channel.send(`You have permissions level: ${users[globalMessage.author.username].permissionLevel}`);
		}else{
			if(users[args]===undefined){
				globalMessage.channel.send(`${args} does not exist in 'users.'`);
			}else{
				globalMessage.channel.send(`${args} has permissions level: ${users[args].permissionLevel}`);
			}
		}
	},
	description:"Returns the internal permissions level of the user.",
	category:"Administrative",
	argsCount:0
});
commands["oceanman"] = new commandConstructor({
	cmdName:"oceanman",
	execute:args => globalMessage.channel.send(oceanman),
	description:`OCEANMAN`,
	category:"Fun",
	argsEnforced:false
});
commands["perm"] = new commandConstructor({
	cmdName:"oceanman",
	execute:args => globalMessage.channel.send("http://cdn.stylisheve.com/wp-content/uploads/2012/01/Perm-Hairstyles-for-men-_03.jpg"),
	description:`The most elegant and effective hairstyle.`,
	category:"Fun",
	argsEnforced:false
});
commands["ur"] = new commandConstructor({
	cmdName:"ur",
	execute:args => globalMessage.channel.send("no u"),
	description:`The most elegant and effective of retorts.`,
	category:"Fun",
	argsEnforced:false
});
commands["say"] = new commandConstructor({
	cmdName:"say",
	execute:args => {
		let input = "";
		let temp = args.split(" ");
		setTimeout(function(){globalMessage.delete(),1000});
		for(i=2;i<temp.length;i++){
			if(i == temp.length-1){
				input+=temp[i];
			}else{
				input+=temp[i] + " ";
			}
		}
		if(temp[0] == "in"){
			if(channels[temp[1]]==undefined){
				globalMessage.channel.send(temp[1] + " is an unknown channel.  Try sending a test message to me in this channel, and I should recognize it afterwards!");
			}else{
				if(globalMessage.guild.channels.get(channels[temp[1]].id).permissionsFor(globalMessage.author).has(0x00000800)){
						globalMessage.guild.channels.get(channels[temp[1]].id).send(input);
				}else{
					globalMessage.channel.send("You do not have permissions to post in this channel!");
				}
			}
		}else{
			globalMessage.channel.send(args);
		}
	},
	description:"Makes me say anything in the current, or specified channel.",
	category:"Utility",
	argsCount:2,
	argsEnforced:false,
	args:{"args1":{name:"Message,'in'", desc:"The message to be sent, or 'in' to use the next argument."},"args2":{name:"Discord Channel",desc:"If 'in' is specified, this argument should contain the channel-name with which to send the message"},"args3":{name:"Message",desc:"The message to send if 'in' is specified."}},
});
commands["simpInterest"] = new commandConstructor({
	cmdName:"simpInterest",
	execute:args => {
		if(typeof Number(args[0])=="number" && typeof Number(args[1])=="number" && typeof Number(args[2])=="number") {
			if(args[1] > 1) args[1] = args[1]/100;
			globalMessage.channel.send(`A $${commas(args[0])} loan, at ${(args[1]*100).toFixed(3)}% interest for ${args[2]} years:\n**Total Balance:** __$${commas(args[0]*(1+args[1]*args[2]))}__\n**Total Accumulated Interest:** __$${commas(args[0]*(1+args[1]*args[2])-args[0])}__`);
		}
		else globalMessage.channel.send(`Make sure the arguments are numbers!`);
	},
	description:"A trivial simple interest calculator!",
	category:"Finance",
	argsCount:3,
	argsEnforced:true,
	args:{"args1":{name:"Principle", desc:"The initial amount of the loan"},"args2":{name:"APR",desc:"The percentage of interest accumulated over one year"},"args3":{name:"Duration",desc:"The length of time during which interest accumulates."}},
	permissionsLevel:0
});
commands["compInterest"] = new commandConstructor({
	cmdName:"compInterest",
	execute:args => {
		if(typeof Number(args[0])=="number" && typeof Number(args[1])=="number" && typeof Number(args[2])=="number") {
			if(args[1] > 1) args[1] = args[1]/100;
			globalMessage.channel.send(`A $${commas(args[0])} compound interest loan, at ${(args[1]*100).toFixed(3)}% interest for ${args[2]} years, compounded ${args[3]} times per year:\n**Total Balance:** __$${commas((args[0]*Math.pow(1+args[1]/args[3],args[3]*args[2])).toFixed(2))}__\n**Total Accumulated Interest:** __$${commas((args[0]*Math.pow(1+args[1]/args[3],args[3]*args[2])-args[0]).toFixed(2))}__`);
		}
		else globalMessage.channel.send(`Make sure the arguments are numbers!`);
	},
	description:"A trivial compound interest calculator!",
	category:"Finance",
	argsCount:4,
	argsEnforced:true,
	args:{"args1":{name:"Principle", desc:"The initial amount of the loan"},"args2":{name:"APR",desc:"The percentage of interest accumulated over one year"},"args3":{name:"Duration",desc:"The length of time during which interest accumulates."},"args4":{name:"Compound Frequency",desc:"The number of times the principle is compounded throughout the duration."}},
	permissionsLevel:0
});
commands["time"] = new commandConstructor({
	cmdName:"time",
	execute:args => {
		let d = new Date();
		let output = `
	 		**[UTC]** __${d.toUTCString()}__\n
			**[EAST]** __${d.toLocaleTimeString('en-US',{timeZone:"America/New_York"})}__\n
			**[CENT]** __${d.toLocaleTimeString('en-US',{timeZone:"America/Chicago"})}__\n
			**[MOUN]** __${d.toLocaleTimeString('en-US',{timeZone:"America/Denver"})}__\n
			**[PACI]** __${d.toLocaleTimeString('en-US',{timeZone:"America/Los_Angeles"})}__
									`;
		globalMessage.channel.send(output);
	},
	description:`Check the time!`,
	category:"Utility",
	argsEnforced:false
});
commands["rpn"] = new interactiveCommand(new commandConstructor({
	cmdName:"rpn",
	execute:args => args,
	description:"**[Interactive Mode]** A simple reverse polish notation calculator!",
	category:"Utility",
	argsEnforced:false,
}),{
	"memory":[],
	"readout":new commandConstructor({
		cmdName:"readout",
		execute:args => {
			let output = "";
			if(users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"].length == 0){
				users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"][0] = 0;
			}
			for(let i=users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"].length-1;i>=0;i--){
				output += `${(memoryResolve[i]===undefined) ? i-1:memoryResolve[i]}: ${users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"][i]}\n`;
			}
			globalMessage.channel.send(output);
		},
		description:"Displays the current stack.",
		category:"int",
		argsEnforced:false
	}),
	"enter":new commandConstructor({
		cmdName:"enter",
		execute:args => {
			let input = Number(args[0]);
			if(isNaN(input)){
				users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"].unshift(0);
			}else{
				if(users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"][0]==0){
					users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"][0]=input;
				}else{
					users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"].unshift(input);
				}
			}
			commands["rpn"].commands["readout"].execute(args);
		},
		description:"Adds a number to the stack!",
		category:"int",
		argsCount:1,
		argsEnforced:true,
		args:{"args1":{name:"Value",desc:"The number to be added to the stack."}}
	}),
	"drop":new commandConstructor({
		cmdName:"drop",
		execute:args => {
			users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"].shift();
			commands["rpn"].commands["readout"].execute(args);
		},
		description:"Moves the stack downward, deleting x.",
		category:"int",
		argsEnforced:false
	}),
	"clear":new commandConstructor({
		cmdName:"clear",
		execute:args => {
			users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"] = [];
			globalMessage.channel.send("Memory has been cleared!");
			commands["rpn"].commands["readout"].execute(args);
		},
		description:"Clears the stack.",
		category:"int",
		argsEnforced:false
	}),
	"swap":new commandConstructor({
		cmdName:"swap",
		execute:args => {
			const b = users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"][0];
			users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"][0] = users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"][1];
			users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"][1] = b;
			commands["rpn"].commands["readout"].execute(args);
		},
		description:"Swaps x and y.",
		category:"int",
		argsEnforced:false
	}),
	"roll":new commandConstructor({
		cmdName:"roll",
		execute:args => {
			users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"][users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"].length] = users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"][0];
			users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"].shift();
			commands["rpn"].commands["readout"].execute(args);
		},
		description:"Shifts all elements downward, and moves x up to the highest index.",
		category:"int",
		argsEnforced:false
	}),
	"add":new commandConstructor({
		cmdName:"add",
		execute:args => {
			if(users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"].length >= 2){
				users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"][1] = Number(users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"][0]) + Number(users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"][1]);
				users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"].shift();
				commands["rpn"].commands["readout"].execute(args);
			}else{
				globalMessage.channel.send("Nothing to add! Use 'enter' to fill in the stack.");
			}
		},
		description:"Adds the numbers in x and y!",
		category:"int",
		argsEnforced:false
	}),
	"sub":new commandConstructor({
		cmdName:"sub",
		execute:args => {
			if(users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"].length >= 2){
				users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"][1] = Number(users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"][1]) - Number(users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"][0]);
				users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"].shift();
				commands["rpn"].commands["readout"].execute(args);
			}else{
				globalMessage.channel.send("Nothing to subtract! Use 'enter' to fill in the stack.");
			}
		},
		description:"Subtracts the numbers in y from x!",
		category:"int",
		argsEnforced:false
	}),
	"mult":new commandConstructor({
		cmdName:"mult",
		execute:args => {
			if(users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"].length >= 2){
				users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"][1] = Number(users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"][1]) * Number(users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"][0]);
				users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"].shift();
				commands["rpn"].commands["readout"].execute(args);
			}else{
				globalMessage.channel.send("Nothing to multiply! Use 'enter' to fill in the stack.");
			}
		},
		description:"Multiplies the numbers in y by x!",
		category:"int",
		argsEnforced:false
	}),
	"div":new commandConstructor({
		cmdName:"div",
		execute:args => {
			if(users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"].length >= 2){
				users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"][1] = Number(users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"][1]) / Number(users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"][0]);
				users[globalMessage.author.username].interactiveCommands["rpn"].longMemory["memory"].shift();
				commands["rpn"].commands["readout"].execute(args);
			}else{
				globalMessage.channel.send("Nothing to divide! Use 'enter' to fill in the stack.");
			}
		},
		description:"Divides the numbers in y by x!",
		category:"int",
		argsEnforced:false
	}),
});
//-----------------The bot's name, and version number (if applicable)------------------
var meta = {
	"botname":"jBot", //Used as the qualifying command.  The bot will activate if this botname is called.
	"version":"6.0"
}

//------------DiscordBot's Core Execution---------------------
for(user in users){
	users[user].interactiveCheck = false;
}
interactiveHelpConstruct();

bot.on('message', (message)=>{
	globalMessage = message;
	let command = message.content.split(" ");
	let args = [];
	if(!checkName){
		bot.user.setActivity('¡POR·TU·GAL!');
		checkName = true;
	}
	for(i=2;i<command.length;i++){
		args[i-2] = command[i];
	}
	if(command[1] === undefined){
		command[1] = "help";
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
		if(channels[globalMessage.channel.name] === undefined){ //If the current user of the bot is not in the users.json file, this will add them with default permissions (0)
			channels[message.channel.name] = {"id":message.channel.id};
		}
		if(users[globalMessage.author.username].interactiveMode && !users[globalMessage.author.username].interactiveCheck){ //Assign the user their own memory units based on interactive functions.
			users[globalMessage.author.username].interactiveCheck = true; //Ensures user only gets assigned commands once.  Will run on startup.
			if(users[globalMessage.author.username].interactiveCommands === undefined){
				users[globalMessage.author.username].interactiveCommands = {};
			}
			for(fn in commands){
				if(commands[fn].interactive){
					if(users[globalMessage.author.username].interactiveCommands[fn] === undefined){
						users[globalMessage.author.username].interactiveCommands[fn] = {longMemory:{}}; // Any object that isn't a function will be stored in users.JSON under interactive commands > [cmdName] > longMemory
					}
					for(sub in commands[fn].commands){
						if(commands[fn].commands[sub].cmdName === undefined){ //Not a subFunction
							if(users[globalMessage.author.username].interactiveCommands[fn].longMemory[sub] === undefined){
								users[globalMessage.author.username].interactiveCommands[fn].longMemory[sub] = [];
							}
							if(sub.includes("short")){ //For short term memory using sub_short, reset memory on restart.
								users[globalMessage.author.username].interactiveCommands[fn].longMemory[sub] = [];
							}
						}
					}
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
						if(c==args.length-1){
							temp+=args[c];
						}else{
							temp+=args[c] + " ";
						}
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
			if(commands[users[globalMessage.author.username].currentCommand].commands[command[1]] === undefined){ //If the interactive command in current command is undefined
				globalMessage.channel.send(`Unrecognized command: '${command[1]} in ${users[globalMessage.author.username].currentCommand}.'`);
			}else{
				if(users[globalMessage.author.username].permissionLevel >= commands[users[globalMessage.author.username].currentCommand].commands[command[1]].permissionsLevel){ //If the user has sufficient interactive permissions
					if((args.length != commands[users[globalMessage.author.username].currentCommand].commands[command[1]].argsCount) && (commands[users[globalMessage.author.username].currentCommand].commands[command[1]].argsEnforced)){ //If the arguments are of the proper number
						globalMessage.channel.send("Wrong number of arguments for " + command[1] + ".");
					}else{
						eval(commands[users[globalMessage.author.username].currentCommand].commands[command[1]].execute(args));
					}
				}
			}
		}
	}
	fs.writeFile('users.json', JSON.stringify(users), err => {if(err) throw err});
	fs.writeFile('channels.json', JSON.stringify(channels), err => {if(err) throw err});
	});


bot.on('error', console.error);
bot.on('guildMemberAdd', member => {
  // Send the message to a designated channel on a server:
  const channel = member.guild.channels.find(ch => ch.name === 'introductions');
  // Do nothing if the channel wasn't found on this server
  if (!channel) return;
  // Send the message, mentioning the member
  channel.send(`Welcome, ${member}!`);
});
bot.login('--BOT LOGIN TOKEN--');
