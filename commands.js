const commands = {
    'process': {
        description: 'Process all images in the images folder',
        script: 'index.js'
    },
    'modify': {
        description: 'Modify image captions',
        script: 'modify-captions.js'
    },
    'resize': {
        description: 'Resize images',
        script: 'resize.js'
    },
    'train': {
        description: 'Start the training process',
        script: 'train.js'
    }
};

function displayCommands() {
    console.log('\nAvailable commands:\n');
    Object.keys(commands).forEach(cmd => {
        console.log(`${cmd}:`);
        console.log(`  Description: ${commands[cmd].description}`);
        console.log(`  Usage: node ${commands[cmd].script}\n`);
    });
}

// If the file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    displayCommands();
}

export { displayCommands, commands };
