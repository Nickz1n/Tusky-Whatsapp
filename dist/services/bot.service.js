import path from "node:path";
import fs from 'fs-extra';
import moment from "moment-timezone";
import { buildText } from "../utils/general.util.js";
import { commandExist, getCommandsByCategory } from "../utils/commands.util.js";
import { commandsAdmin } from "../commands/admin.list.commands.js";
import { waLib } from "../libraries/library.js";
export class BotService {
    constructor() {
        this.pathJSON = path.resolve("storage/bot.json");
        const storageFolderExists = fs.pathExistsSync(path.resolve("storage"));
        const jsonFileExists = fs.existsSync(this.pathJSON);
        if (!storageFolderExists) {
            fs.mkdirSync(path.resolve("storage"), { recursive: true });
        }
        if (!jsonFileExists) {
            this.initBot();
        }
    }
    initBot() {
        const bot = {
            started: 0,
            host_number: '',
            name: "LBOT",
            author_sticker: "Leal",
            pack_sticker: "LBOT Sticker",
            prefix: "!",
            executed_cmds: 0,
            database_updated: true,
            autosticker: false,
            commands_pv: true,
            admin_mode: false,
            block_cmds: [],
            command_rate: {
                status: false,
                max_cmds_minute: 5,
                block_time: 60,
            }
        };
        this.updateBot(bot);
    }
    updateBot(bot) {
        fs.writeFileSync(this.pathJSON, JSON.stringify(bot));
    }
    deleteBotData() {
        fs.writeFileSync(this.pathJSON, JSON.stringify({}));
    }
    rebuildBot() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        const oldBotData = this.getBot();
        const newBotData = {
            started: (_a = oldBotData.started) !== null && _a !== void 0 ? _a : 0,
            host_number: (_b = oldBotData.host_number) !== null && _b !== void 0 ? _b : '',
            name: (_c = oldBotData.name) !== null && _c !== void 0 ? _c : 'LBOT',
            author_sticker: (_d = oldBotData.author_sticker) !== null && _d !== void 0 ? _d : 'Leal',
            pack_sticker: (_e = oldBotData.pack_sticker) !== null && _e !== void 0 ? _e : 'LBOT Sticker',
            prefix: (_f = oldBotData.prefix) !== null && _f !== void 0 ? _f : "!",
            executed_cmds: (_g = oldBotData.executed_cmds) !== null && _g !== void 0 ? _g : 0,
            database_updated: (_h = oldBotData.database_updated) !== null && _h !== void 0 ? _h : true,
            autosticker: (_j = oldBotData.autosticker) !== null && _j !== void 0 ? _j : false,
            commands_pv: (_k = oldBotData.commands_pv) !== null && _k !== void 0 ? _k : true,
            admin_mode: (_l = oldBotData.admin_mode) !== null && _l !== void 0 ? _l : false,
            block_cmds: (_m = oldBotData.block_cmds) !== null && _m !== void 0 ? _m : [],
            command_rate: {
                status: (_o = oldBotData.command_rate.status) !== null && _o !== void 0 ? _o : false,
                max_cmds_minute: (_p = oldBotData.command_rate.max_cmds_minute) !== null && _p !== void 0 ? _p : 5,
                block_time: (_q = oldBotData.command_rate.block_time) !== null && _q !== void 0 ? _q : 60,
            }
        };
        this.deleteBotData();
        this.updateBot(newBotData);
    }
    startBot(hostNumber) {
        let bot = this.getBot();
        bot.started = moment.now();
        bot.host_number = hostNumber;
        this.updateBot(bot);
    }
    getBot() {
        return JSON.parse(fs.readFileSync(this.pathJSON, { encoding: "utf-8" }));
    }
    setNameBot(name) {
        let bot = this.getBot();
        bot.name = name;
        return this.updateBot(bot);
    }
    setAuthorSticker(name) {
        let bot = this.getBot();
        bot.author_sticker = name;
        return this.updateBot(bot);
    }
    setPackSticker(name) {
        let bot = this.getBot();
        bot.pack_sticker = name;
        return this.updateBot(bot);
    }
    setDatabaseUpdated(status) {
        let bot = this.getBot();
        bot.database_updated = status;
        return this.updateBot(bot);
    }
    setPrefix(prefix) {
        let bot = this.getBot();
        bot.prefix = prefix;
        return this.updateBot(bot);
    }
    isDatabaseUpdated() {
        var _a;
        let bot = this.getBot();
        return (_a = bot.database_updated) !== null && _a !== void 0 ? _a : false;
    }
    storeMessageOnCache(message, messageCache) {
        if (message.key.remoteJid && message.key.id && message.message) {
            messageCache.set(message.key.id, message.message);
        }
    }
    getMessageFromCache(messageId, messageCache) {
        let message = messageCache.get(messageId);
        return message;
    }
    incrementExecutedCommands() {
        let bot = this.getBot();
        bot.executed_cmds++;
        return this.updateBot(bot);
    }
    // Recursos do BOT
    // Auto-Sticker
    setAutosticker(status) {
        let bot = this.getBot();
        bot.autosticker = status;
        return this.updateBot(bot);
    }
    // Modo admin
    setAdminMode(status) {
        let bot = this.getBot();
        bot.admin_mode = status;
        return this.updateBot(bot);
    }
    // Comandos no PV
    setCommandsPv(status) {
        let bot = this.getBot();
        bot.commands_pv = status;
        return this.updateBot(bot);
    }
    // Taxa de comandos
    async setCommandRate(status, maxCommandsMinute, blockTime) {
        let bot = this.getBot();
        bot.command_rate.status = status;
        bot.command_rate.max_cmds_minute = maxCommandsMinute;
        bot.command_rate.block_time = blockTime;
        return this.updateBot(bot);
    }
    // Bloquear/Desbloquear comandos
    blockCommandsGlobally(commands) {
        let botInfo = this.getBot();
        const adminCommands = commandsAdmin(botInfo);
        const { prefix } = botInfo;
        let blockResponse = adminCommands.bcmdglobal.msgs.reply_title;
        let categories = ['sticker', 'utility', 'download', 'misc'];
        if (commands[0] == 'variado') {
            commands[0] = 'misc';
        }
        else if (commands[0] == 'utilidade') {
            commands[0] = 'utility';
        }
        if (categories.includes(commands[0])) {
            commands = getCommandsByCategory(botInfo, commands[0]);
        }
        for (let command of commands) {
            if (commandExist(botInfo, command, 'utility') || commandExist(botInfo, command, 'misc') || commandExist(botInfo, command, 'sticker') || commandExist(botInfo, command, 'download')) {
                if (botInfo.block_cmds.includes(waLib.removePrefix(prefix, command))) {
                    blockResponse += buildText(adminCommands.bcmdglobal.msgs.reply_item_already_blocked, command);
                }
                else {
                    botInfo.block_cmds.push(waLib.removePrefix(prefix, command));
                    blockResponse += buildText(adminCommands.bcmdglobal.msgs.reply_item_blocked, command);
                }
            }
            else if (commandExist(botInfo, command, 'group') || commandExist(botInfo, command, 'admin') || commandExist(botInfo, command, 'info')) {
                blockResponse += buildText(adminCommands.bcmdglobal.msgs.reply_item_error, command);
            }
            else {
                blockResponse += buildText(adminCommands.bcmdglobal.msgs.reply_item_not_exist, command);
            }
        }
        this.updateBot(botInfo);
        return blockResponse;
    }
    unblockCommandsGlobally(commands) {
        let botInfo = this.getBot();
        const adminCommands = commandsAdmin(botInfo);
        const { prefix } = botInfo;
        let unblockResponse = adminCommands.dcmdglobal.msgs.reply_title;
        let categories = ['all', 'sticker', 'utility', 'download', 'misc'];
        if (commands[0] == 'todos') {
            commands[0] = 'all';
        }
        else if (commands[0] == 'utilidade') {
            commands[0] = 'utility';
        }
        else if (commands[0] == 'variado') {
            commands[0] = 'misc';
        }
        if (categories.includes(commands[0])) {
            if (commands[0] === 'all') {
                commands = botInfo.block_cmds.map(command => prefix + command);
            }
            else {
                commands = getCommandsByCategory(botInfo, commands[0]);
            }
        }
        for (let command of commands) {
            if (botInfo.block_cmds.includes(waLib.removePrefix(prefix, command))) {
                let commandIndex = botInfo.block_cmds.findIndex(command_blocked => command_blocked == waLib.removePrefix(prefix, command));
                botInfo.block_cmds.splice(commandIndex, 1);
                unblockResponse += buildText(adminCommands.dcmdglobal.msgs.reply_item_unblocked, command);
            }
            else {
                unblockResponse += buildText(adminCommands.dcmdglobal.msgs.reply_item_not_blocked, command);
            }
        }
        this.updateBot(botInfo);
        return unblockResponse;
    }
    isCommandBlockedGlobally(command) {
        let botInfo = this.getBot();
        const { prefix } = botInfo;
        return botInfo.block_cmds.includes(waLib.removePrefix(prefix, command));
    }
}
