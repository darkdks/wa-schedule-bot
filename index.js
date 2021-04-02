const wa = require('@open-wa/wa-automate');
const {
    randomInt
} = require('crypto');
const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');
const jsonFiles = [];
const scheduledTasks = []
const tasks = []
fs
    .readdirSync(path.join(__dirname, 'chats')).forEach(file => {
        jsonFiles.push(JSON.parse(fs.readFileSync(path.join(__dirname, 'chats', file))));
    });


wa.create({
    sessionId: "FESSORA_TEST",
    authTimeout: 60, //wait only 60 seconds to get a connection with the host account device
    blockCrashLogs: true,
    disableSpins: true,
    headless: true,
    hostNotificationLang: 'PT_BR',
    logConsole: true,
    popup: true,
    qrTimeout: 0, //0 means it will wait forever for you to scan the qr code
}).then(client => {
    start(client);
    client.getAllContacts().then(allContacts => {
        jsonFiles.forEach(mytask => {
            const contactID = getContactId(allContacts, mytask.contactName);
            if (contactID) {
                mytask.id = contactID;
                tasks.push(mytask);
            } else {
                console.log('No id for task of name :' + mytask.contactName)
            }
        });
    

        console.log('scheduledTasks: ' + tasks.length);
        console.log(tasks);
        tasks.forEach(() => {
            scheduledTasks.push(schedule.scheduleJob('42 * * * *', async () => {
                console.log('Executing job');
              }))
        });

    })

});
function getContactId(contacts = [], name = '') {
   const contact = contacts.find((contact) => (contact.name === name));
   return contact ? contact.id : undefined;
};

function start(client) {
    client.onMessage(async message => {
        if (message.body === 'Hi') {
            await client.sendText(message.from, '👋 Hello! Eu sou um bot! :D');
            console.log(message.from);
        }
    })
};


