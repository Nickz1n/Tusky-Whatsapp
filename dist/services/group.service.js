import { buildText } from '../utils/general.util.js';
import { commandsGroup } from "../commands/group.list.commands.js";
import { commandExist, getCommandsByCategory } from "../utils/commands.util.js";
import { waLib } from "../libraries/library.js";
import DataStore from "@seald-io/nedb";
import { ParticipantService } from "./participant.service.js";
const db = new DataStore({ filename: './storage/groups.db', autoload: true });
export class GroupService {
    constructor() {
        this.participantService = new ParticipantService();
    }
    // *********************** Registra/Atualiza/Remove grupos ***********************
    async registerGroup(groupMetadata) {
        const isRegistered = await this.isRegistered(groupMetadata.id);
        if (isRegistered) {
            return;
        }
        const groupData = {
            id: groupMetadata.id,
            name: groupMetadata.subject,
            description: groupMetadata.desc,
            commands_executed: 0,
            owner: groupMetadata.owner,
            restricted: groupMetadata.announce,
            expiration: groupMetadata.ephemeralDuration,
            muted: false,
            welcome: { status: false, msg: '' },
            antifake: { status: false, allowed: [] },
            antilink: false,
            antiflood: { status: false, max_messages: 10, interval: 10 },
            autosticker: false,
            block_cmds: [],
            blacklist: [],
            word_filter: []
        };
        const newGroup = await db.insertAsync(groupData);
        for (let participant of groupMetadata.participants) {
            const isAdmin = (participant.admin) ? true : false;
            await this.participantService.addParticipant(groupMetadata.id, participant.id, isAdmin);
        }
        return newGroup;
    }
    async rebuildGroups() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        const groups = await this.getAllGroups();
        for (let group of groups) {
            const oldGroupData = group;
            const updatedGroupData = {
                id: oldGroupData.id,
                name: oldGroupData.name,
                description: oldGroupData.description,
                commands_executed: oldGroupData.commands_executed,
                owner: oldGroupData.owner,
                restricted: oldGroupData.restricted,
                expiration: oldGroupData.expiration,
                muted: (_a = oldGroupData.muted) !== null && _a !== void 0 ? _a : false,
                welcome: {
                    status: (_b = oldGroupData.welcome.status) !== null && _b !== void 0 ? _b : false,
                    msg: (_c = oldGroupData.welcome.msg) !== null && _c !== void 0 ? _c : ''
                },
                antifake: {
                    status: (_d = oldGroupData.antifake.status) !== null && _d !== void 0 ? _d : false,
                    allowed: (_e = oldGroupData.antifake.allowed) !== null && _e !== void 0 ? _e : []
                },
                antilink: (_f = oldGroupData.antilink) !== null && _f !== void 0 ? _f : false,
                antiflood: {
                    status: (_g = oldGroupData.antiflood.status) !== null && _g !== void 0 ? _g : false,
                    max_messages: (_h = oldGroupData.antiflood.max_messages) !== null && _h !== void 0 ? _h : 10,
                    interval: (_j = oldGroupData.antiflood.interval) !== null && _j !== void 0 ? _j : 10
                },
                autosticker: (_k = oldGroupData.autosticker) !== null && _k !== void 0 ? _k : false,
                block_cmds: (_l = oldGroupData.block_cmds) !== null && _l !== void 0 ? _l : [],
                blacklist: (_m = oldGroupData.blacklist) !== null && _m !== void 0 ? _m : [],
                word_filter: (_o = oldGroupData.word_filter) !== null && _o !== void 0 ? _o : []
            };
            await db.removeAsync({ id: group.id }, {});
            await db.insertAsync(updatedGroupData);
        }
    }
    async syncGroups(groupsMeta) {
        //Deletando grupos em que o bot não está mais
        const currentGroups = await this.getAllGroups();
        currentGroups.forEach(async (group) => {
            if (!groupsMeta.find(groupMeta => groupMeta.id == group.id)) {
                await this.removeGroup(group.id);
            }
        });
        //Atualizando grupos em que o bot está
        for (let groupMeta of groupsMeta) {
            const isRegistered = await this.isRegistered(groupMeta.id);
            if (isRegistered) { // Se o grupo já estiver registrado sincronize os dados do grupo e os participantes.
                await db.updateAsync({ id: groupMeta.id }, { $set: {
                        name: groupMeta.subject,
                        description: groupMeta.desc,
                        owner: groupMeta.owner,
                        restricted: groupMeta.announce,
                        expiration: groupMeta.ephemeralDuration
                    } });
                await this.participantService.syncParticipants(groupMeta);
            }
            else { // Se o grupo não estiver registrado, faça o registro.
                await this.registerGroup(groupMeta);
            }
        }
    }
    updatePartialGroup(group) {
        if (group.id) {
            if (group.desc) {
                return this.setDescription(group.id, group.desc);
            }
            else if (group.subject) {
                return this.setName(group.id, group.subject);
            }
            else if (group.announce) {
                return this.setRestricted(group.id, group.announce);
            }
            else if (group.ephemeralDuration) {
                return this.setExpiration(group.id, group.ephemeralDuration);
            }
        }
    }
    async getGroup(groupId) {
        const group = await db.findOneAsync({ id: groupId });
        return group;
    }
    async removeGroup(groupId) {
        await this.participantService.removeParticipants(groupId);
        return db.removeAsync({ id: groupId }, { multi: true });
    }
    async getAllGroups() {
        const groups = await db.findAsync({});
        return groups;
    }
    async isRegistered(groupId) {
        const group = await this.getGroup(groupId);
        return (group != null);
    }
    async isRestricted(groupId) {
        const group = await this.getGroup(groupId);
        return group === null || group === void 0 ? void 0 : group.restricted;
    }
    setName(groupId, name) {
        return db.updateAsync({ id: groupId }, { $set: { name } });
    }
    setRestricted(groupId, restricted) {
        return db.updateAsync({ id: groupId }, { $set: { restricted } });
    }
    setExpiration(groupId, expiration) {
        return db.updateAsync({ id: groupId }, { $set: { expiration } });
    }
    setDescription(groupId, description) {
        return db.updateAsync({ id: groupId }, { $set: { description } });
    }
    incrementGroupCommands(groupId) {
        return db.updateAsync({ id: groupId }, { $inc: { commands_executed: 1 } });
    }
    async getOwner(groupId) {
        const group = await this.getGroup(groupId);
        return group === null || group === void 0 ? void 0 : group.owner;
    }
    // *********************** RECURSOS DO GRUPO ***********************
    // ***** FILTRO DE PALAVRAS *****
    addWordFilter(groupId, word) {
        return db.updateAsync({ id: groupId }, { $push: { word_filter: word } });
    }
    removeWordFilter(groupId, word) {
        return db.updateAsync({ id: groupId }, { $pull: { word_filter: word } });
    }
    // ***** BEM-VINDO *****
    setWelcome(groupId, status, msg) {
        return db.updateAsync({ id: groupId }, { $set: { "welcome.status": status, "welcome.msg": msg } });
    }
    // ***** ANTI-FAKE *****
    setAntifake(groupId, status, allowed) {
        return db.updateAsync({ id: groupId }, { $set: { "antifake.status": status, "antifake.allowed": allowed } });
    }
    isNumberFake(group, userId) {
        const allowedPrefixes = group.antifake.allowed;
        for (let numberPrefix of allowedPrefixes) {
            if (userId.startsWith(numberPrefix)) {
                return false;
            }
        }
        return true;
    }
    // ***** MUTAR GRUPO *****
    setMuted(groupId, status) {
        return db.updateAsync({ id: groupId }, { $set: { muted: status } });
    }
    // ***** ANTI-LINK *****
    setAntilink(groupId, status) {
        return db.updateAsync({ id: groupId }, { $set: { antilink: status } });
    }
    // ***** AUTO-STICKER *****
    setAutosticker(groupId, status) {
        return db.updateAsync({ id: groupId }, { $set: { autosticker: status } });
    }
    // ***** ANTI-FLOOD *****
    async setAntiFlood(groupId, status, maxMessages, interval) {
        return db.updateAsync({ id: groupId }, { $set: { 'antiflood.status': status, 'antiflood.max_messages': maxMessages, 'antiflood.interval': interval } });
    }
    // ***** LISTA-NEGRA *****
    async getBlackList(groupId) {
        const group = await this.getGroup(groupId);
        return (group === null || group === void 0 ? void 0 : group.blacklist) || [];
    }
    addBlackList(groupId, userId) {
        return db.updateAsync({ id: groupId }, { $push: { blacklist: userId } });
    }
    removeBlackList(groupId, userId) {
        return db.updateAsync({ id: groupId }, { $pull: { blacklist: userId } });
    }
    async isBlackListed(groupId, userId) {
        const list = await this.getBlackList(groupId);
        return list.includes(userId);
    }
    // ***** BLOQUEAR/DESBLOQUEAR COMANDOS *****
    async blockCommands(group, commands, botInfo) {
        const { prefix } = botInfo;
        const groupCommands = commandsGroup(botInfo);
        let blockedCommands = [];
        let blockResponse = groupCommands.bcmd.msgs.reply_title;
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
                if (group.block_cmds.includes(waLib.removePrefix(prefix, command))) {
                    blockResponse += buildText(groupCommands.bcmd.msgs.reply_item_already_blocked, command);
                }
                else {
                    blockedCommands.push(waLib.removePrefix(prefix, command));
                    blockResponse += buildText(groupCommands.bcmd.msgs.reply_item_blocked, command);
                }
            }
            else if (commandExist(botInfo, command, 'group') || commandExist(botInfo, command, 'admin') || commandExist(botInfo, command, 'info')) {
                blockResponse += buildText(groupCommands.bcmd.msgs.reply_item_error, command);
            }
            else {
                blockResponse += buildText(groupCommands.bcmd.msgs.reply_item_not_exist, command);
            }
        }
        if (blockedCommands.length != 0) {
            await db.updateAsync({ id: group.id }, { $push: { block_cmds: { $each: blockedCommands } } });
        }
        return blockResponse;
    }
    async unblockCommand(group, commands, botInfo) {
        const groupCommands = commandsGroup(botInfo);
        const { prefix } = botInfo;
        let unblockedCommands = [];
        let unblockResponse = groupCommands.dcmd.msgs.reply_title;
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
                commands = group.block_cmds.map(command => prefix + command);
            }
            else {
                commands = getCommandsByCategory(botInfo, commands[0]);
            }
        }
        for (let command of commands) {
            if (group.block_cmds.includes(waLib.removePrefix(prefix, command))) {
                unblockedCommands.push(waLib.removePrefix(prefix, command));
                unblockResponse += buildText(groupCommands.dcmd.msgs.reply_item_unblocked, command);
            }
            else {
                unblockResponse += buildText(groupCommands.dcmd.msgs.reply_item_not_blocked, command);
            }
        }
        if (unblockedCommands.length != 0) {
            await db.updateAsync({ id: group.id }, { $pull: { block_cmds: { $in: unblockedCommands } } });
        }
        return unblockResponse;
    }
    isBlockedCommand(group, command, botInfo) {
        const { prefix } = botInfo;
        return group.block_cmds.includes(waLib.removePrefix(prefix, command));
    }
}
