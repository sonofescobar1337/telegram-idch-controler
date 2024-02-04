const TelegramBot = require('node-telegram-bot-api');
const mod = require('./module')

require('dotenv').config();


const botToken = process.env.BOT_TOKEN;
const apikey = process.env.API_KEY;
const bot = new TelegramBot(botToken, { polling: true });


bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        bot.sendMessage(chatId, `Halo! Silahkan klik /menu untuk melihat fitur`);

    } catch (error) {
        bot.sendMessage(chatId, 'Terjadi kesalahan. Silakan coba lagi nanti atau coba cek console.');
    }

});


bot.onText(/\/menu/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const auth = await mod.auth(apikey);
        //console.log(auth)
        if (auth.respon.message) {
            bot.sendMessage(chatId, `Invalid apikey, silahkan mengubah apikey sesuai dengan access yang anda punya, silahkan baca README.MD`);

        } else {
            let replyMarkup = {
                inline_keyboard: [
                    [{ text: '♻️ Get Location', callback_data: 'location' }],
                ],
                resize_keyboard: true,
            };
            const options = {
                reply_markup: JSON.stringify(replyMarkup),
            };
            bot.sendMessage(chatId, `Welcome ${auth.respon.profile_data.first_name}`, options);
        }
    } catch (error) {

    }

});





bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    //const findchat = await Telegramwaiting.findOne({ chat_id: chatId });
    try {
        if (data === 'location') {
            const vm = await mod.getlocation(apikey)
            // Gawe array nggo nyimpen tombol e su
            let keyboardButtons = [];


            // parshing respon json e
            vm.respon.forEach(location => {
                // ngolehno value seng di butuhno
                const displayName = location.display_name;
                const slug = location.slug;

                // ngepush nang tombol array
                keyboardButtons.push([{ text: `${displayName} [${slug}]`, callback_data: `getvm-${slug}` }]);
            });
            // nggawe replyMarkup nganggo inline_keyboard sesuai karo array seng wes digawe
            let replyMarkup = {
                inline_keyboard: keyboardButtons,
                resize_keyboard: true,
            };

            const options = {
                reply_markup: JSON.stringify(replyMarkup),
            };

            //console.log(vm)
            bot.sendMessage(chatId, 'Klik salah satu tombol untuk melakukan get vm.', options);
        } else if (data.startsWith('getvm-')) {
            const slug = data.replace('getvm-', ''); // njukuk nggon slug e mbot o
            const vmlist = await mod.getvmlist(apikey, slug);
            if (vmlist.respon.length === 0) {
                // Kondisi ketika vm lo ga ada
                bot.sendMessage(query.message.chat.id, 'Tidak ada VM di lokasi tersebut.');
            } else {

                let keyboardButtons = [];
                vmlist.respon.forEach(location => {
                    // ngolehno value seng di butuhno
                    const vmname = location.name;
                    const uuid = location.uuid;

                    // ngepush nang tombol array
                    keyboardButtons.push([{ text: `${vmname}`, callback_data: `control-${uuid}|${slug}` }]);
                });
                //console.log(getVmResponse);
                let replyMarkup = {
                    inline_keyboard: keyboardButtons,
                    resize_keyboard: true,
                };

                const options = {
                    reply_markup: JSON.stringify(replyMarkup),
                };
                // misuhi raimu
                bot.sendMessage(query.message.chat.id, `List VM kamu`, options);
            }
        } else if (data.startsWith('control-')) {
            const mikir = data.replace('control-', '');
            const pisah = mikir.split('|');
            const uid = pisah[0];
            const slug = pisah[1];
            //console.log(uid);
            //console.log(slug)
            const vminfo = await mod.getvmingfo(apikey, uid, slug);
            let statusMessage = '';
            if (vminfo.respon.status === 'stopped') {
                statusMessage = '🔴 STOPPED';

                let replyMarkup = {
                    inline_keyboard: [
                        [{ text: '🟢 Start', callback_data: `action-start-${uid}|${slug}` },
                        { text: '🟡 Check Status', callback_data: `action-reboot-${uid}|${slug}` }],
                    ],
                    resize_keyboard: true,
                };

                const options = {
                    reply_markup: JSON.stringify(replyMarkup),
                };

                bot.sendMessage(query.message.chat.id, `[++++++++ VM INFO ++++++++ ]\nNama VM : ${vminfo.respon.hostname}\nStatus: ${statusMessage}\nPrivate IP : ${vminfo.respon.private_ipv4}\nSize VM : ${vminfo.respon.vcpu}/${vminfo.respon.memory}\nCreated At : ${vminfo.respon.created_at}\nUpdated At : ${vminfo.respon.updated_at}`, options);

            } else if (vminfo.respon.status === 'running') {
                statusMessage = '🟢 RUNNING';

                let replyMarkup = {
                    inline_keyboard: [
                        [{ text: '🔴 Shutdown', callback_data: `action-shutdown-${uid}|${slug}` },
                        { text: '🔴 Force Shutdown', callback_data: `action-force-${uid}|${slug}` }],
                        [
                            { text: '♻️ Reboot', callback_data: `action-reboot-${uid}|${slug}` },
                            { text: '🟡 Check Status', callback_data: `action-status-${uid}|${slug}` }],
                    ],
                    resize_keyboard: true,
                };

                const options = {
                    reply_markup: JSON.stringify(replyMarkup),
                };

                bot.sendMessage(query.message.chat.id, `[++++++++ VM INFO ++++++++ ]\nNama VM : ${vminfo.respon.hostname}\nStatus: ${statusMessage}\nPrivate IP : ${vminfo.respon.private_ipv4}\nSize VM : ${vminfo.respon.vcpu}/${vminfo.respon.memory}\nCreated At : ${vminfo.respon.created_at}\nUpdated At : ${vminfo.respon.updated_at}`, options);
            } else {
                statusMessage = '🟡 UNKNOWN';
                // Jika status VM tidak sesuai, munculkan tombol untuk check status saja
                let replyMarkup = {
                    inline_keyboard: [
                        [{ text: '🟡 Check Status', callback_data: `action-status-${uid}|${slug}` }],
                    ],
                    resize_keyboard: true,
                };

                const options = {
                    reply_markup: JSON.stringify(replyMarkup),
                };

                bot.sendMessage(query.message.chat.id, `[++++++++ VM INFO ++++++++ ]\nNama VM : ${vminfo.respon.hostname}\nStatus: ${statusMessage}\nPrivate IP : ${vminfo.respon.private_ipv4}\nSize VM : ${vminfo.respon.vcpu}/${vminfo.respon.memory}\nCreated At : ${vminfo.respon.created_at}\nUpdated At : ${vminfo.respon.updated_at}`, options);

            }
            //console.log(vminfo)



        } else if(data.startsWith('action-start')) {

            
        }
    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, 'Terjadi kesalahan. Silakan coba lagi nanti.');
    }
});





bot.on('message', (msg) => {
    console.log(`Message from ${msg.from.username}: ${msg.text}`);
});


module.exports = bot;
