const wa = require('@open-wa/wa-automate');
const {
    randomInt
} = require('crypto');
const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');
const jsonFiles = [];
const tasks = []


fs.readdirSync(path.join(__dirname, 'chats')).forEach(file => {
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
        jsonFiles.forEach(task => {
            const contactID = getContactId(allContacts, task.contactName);
            if (contactID) {
                task.id = contactID;
                const [day, month, year] = [...task.date.split('/')];
                const [hour, minute] = [...task.time.split(':')];
                const dateToExecute = new Date(year, month - 1, day, hour, minute, 0);
                if (dateToExecute > Date.now()) {
                    const job = schedule.scheduleJob(dateToExecute, () => (sendMessageTo(client, task)));
                    if (job) {
                        console.log('--- Scheduled chats ---');
                        console.log('Contact: ' + task.contactName + ' ID: ' + task.id);
                        console.log('Fire on: ' + task.date + ' ' + task.time);
                        console.log('Message: ' + task.message);
                    }
                };
            } else {
                console.log('No id for task of name :' + task.contactName)
            }
        });
    });

});

function getContactId(contacts = [], name = '') {
    const contact = contacts.find((contact) => (contact.name === name));
    return contact ? contact.id : undefined;
};

async function sendMessageTo(client, contact) {
    await client.sendText(contact.id, contact.message);
    console.log('Executing job ' + contact.contactName);
};

function start(client) {
    client.onMessage(async message => {
        if (message.body === 'Hi') {
            await client.sendText(message.from, '👋 Hello! Eu sou um bot! :D');
        } else {
            console.log(message.from + ' : ' + message.body);
        }
    })
};
