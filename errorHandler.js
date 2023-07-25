// Require the necessary files and modules
const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const { botName, botAvatarUrl, botLink, devChannelId } = require('./EHconfig.json');

// Define error types
const type_table = {
	1: 'Logged in',
	2: 'Prior to login',
	3: 'From temp file',
	4: 'Recursive',
	5: 'Erring error',
	6: 'Infinitely recursive',
	7: 'From persistent file',
	8: 'Called restart'
};
const color_table = {
	1: '#ffff00',
	2: '#ffff00',
	3: '#ffff00',
	4: '#ff0000',
	5: '#ff5500',
	6: '#ff0000',
	7: '#ff0000',
	8: '#88ff00'
};

//errHandle function
let errHandle = function(error, type, client) {

	//Log error in console and files
	console.error(`Error Handled (${type_table[type]}):\n${error}`);
	if (type !== 8) fs.writeFileSync('./error.txt',`${type_table[type]}\n${error}`);

	if (type === 2 || type === 4 || type === 6) {
		fs.appendFileSync('./tempError.txt',`${type_table[type]}\n${error}\n`);
	};
	if (type === 4 || type === 6) {
		fs.appendFileSync('./persistError.txt',`${type_table[type]}\n${error}\n`);
	};
	if (type === 3) {
		fs.unlinkSync('./tempError.txt');
	}

	// Make embed for normal errors
	const errorEmbed = new MessageEmbed()
		.setColor(`${color_table[type]}`)
		.setTitle('I have handled an error!')
		.setAuthor({name: botName, iconURL: botAvatarUrl, url: botLink})
		.setDescription('Something went wrong, and I am here to tell you about it. I managed to recover, but at what cost?')
		.addFields(
			{name: 'Error', value: `${error}`, inline: false},
			{name: 'Error Type', value: `${type_table[type]}`, inline: true}
		)
		//.setThumbnail('https://i.ibb.co/BVKGkd9/gayliens.png')
		.setTimestamp();

	// Make embed for persistent errors
	const persistErrorEmbed = new MessageEmbed()
		.setColor(`${color_table[type]}`)
		.setTitle('I have handled a persistent error!')
		.setAuthor({name: botName, iconURL: botAvatarUrl, url: botLink})
		.setDescription('Something went wrong, and I am here to tell you about it. I was not able to resolve the error. As such, it needs to be manually cleared from my files.')
		.addFields(
			{name: 'Error', value: `${error}`, inline: false},
			{name: 'Error Type', value: `${type_table[type]}`, inline: true}
		)
		//.setThumbnail('https://i.ibb.co/BVKGkd9/gayliens.png')
		.setTimestamp();

	// Do your best to deliver or log the error(s)
	try {
		if (type !== 2 && type !== 4 && type !== 6 && type !== 7) {
			client.channels.cache.get(devChannelId).send({embeds: [errorEmbed] });
		} else if (type === 7) {
			client.channels.cache.get(devChannelId).send({embeds: [persistErrorEmbed] });
		}
	} catch (error) {
		if (type !== 4 && type !== 6) {
			console.error('An error just recurred!')
			errHandle(error, 4, client);
		} else if (type !== 6) {
			console.error('An error just recurred twice! Changing type to infinite.')
			errHandle(error, 6, client);
		} else {
			console.error('An infinite error has been caught. Stopping error recursion.')
		}
	}
};

module.exports = {errHandle};