import { timestampToDate } from '../utils/general.util.js';
import moment from 'moment-timezone';
import DataStore from "@seald-io/nedb";
const db = new DataStore({ filename: './storage/participants.groups.db', autoload: true });
export class ParticipantService {
    async syncParticipants(groupMeta) {
        //Adiciona participantes no banco de dados que entraram enquanto o bot estava off.
        groupMeta.participants.forEach(async (participant) => {
            const isAdmin = (participant.admin) ? true : false;
            const isGroupParticipant = await this.isGroupParticipant(groupMeta.id, participant.id);
            if (!isGroupParticipant) {
                await this.addParticipant(groupMeta.id, participant.id, isAdmin);
            }
            else {
                await db.updateAsync({ group_id: groupMeta.id, user_id: participant.id }, { $set: { admin: isAdmin } });
            }
        });
        //Remove participantes do banco de dados que sairam do grupo enquanto o bot estava off.
        const currentParticipants = await this.getParticipantsFromGroup(groupMeta.id);
        currentParticipants.forEach(async (participant) => {
            if (!groupMeta.participants.find(groupMetaParticipant => groupMetaParticipant.id == participant.user_id)) {
                await this.removeParticipant(groupMeta.id, participant.user_id);
            }
        });
    }
    async addParticipant(groupId, userId, isAdmin) {
        const isGroupParticipant = await this.isGroupParticipant(groupId, userId);
        if (isGroupParticipant) {
            return;
        }
        const participant = {
            group_id: groupId,
            user_id: userId,
            registered_since: timestampToDate(moment.now()),
            commands: 0,
            admin: isAdmin,
            msgs: 0,
            image: 0,
            audio: 0,
            sticker: 0,
            video: 0,
            text: 0,
            other: 0,
            warnings: 0,
            antiflood: {
                expire: 0,
                msgs: 0
            }
        };
        return db.insertAsync(participant);
    }
    async rebuildParticipants() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const participants = await this.getAllParticipants();
        for (let participant of participants) {
            const oldParticipantData = participant;
            const updatedParticipantData = {
                group_id: oldParticipantData.group_id,
                user_id: oldParticipantData.user_id,
                registered_since: oldParticipantData.registered_since,
                commands: oldParticipantData.commands,
                admin: oldParticipantData.admin,
                msgs: (_a = oldParticipantData.msgs) !== null && _a !== void 0 ? _a : 0,
                image: (_b = oldParticipantData.image) !== null && _b !== void 0 ? _b : 0,
                audio: (_c = oldParticipantData.audio) !== null && _c !== void 0 ? _c : 0,
                sticker: (_d = oldParticipantData.sticker) !== null && _d !== void 0 ? _d : 0,
                video: (_e = oldParticipantData.video) !== null && _e !== void 0 ? _e : 0,
                text: (_f = oldParticipantData.text) !== null && _f !== void 0 ? _f : 0,
                other: (_g = oldParticipantData.other) !== null && _g !== void 0 ? _g : 0,
                warnings: (_h = oldParticipantData.warnings) !== null && _h !== void 0 ? _h : 0,
                antiflood: {
                    expire: (_j = oldParticipantData.antiflood.expire) !== null && _j !== void 0 ? _j : 0,
                    msgs: (_k = oldParticipantData.antiflood.msgs) !== null && _k !== void 0 ? _k : 0
                }
            };
            await db.removeAsync({ user_id: participant.user_id, group_id: participant.group_id }, {});
            await db.insertAsync(updatedParticipantData);
        }
    }
    async removeParticipant(groupId, userId) {
        return db.removeAsync({ group_id: groupId, user_id: userId }, {});
    }
    async removeParticipants(groupId) {
        return db.removeAsync({ group_id: groupId }, { multi: true });
    }
    async addAdmin(groupId, userId) {
        const isGroupAdmin = await this.isGroupAdmin(groupId, userId);
        if (!isGroupAdmin) {
            return db.updateAsync({ group_id: groupId, user_id: userId }, { $set: { admin: true } });
        }
    }
    async removeAdmin(groupId, userId) {
        const isGroupAdmin = await this.isGroupAdmin(groupId, userId);
        if (isGroupAdmin) {
            return db.updateAsync({ group_id: groupId, user_id: userId }, { $set: { admin: false } });
        }
    }
    async getParticipantFromGroup(groupId, userId) {
        const participant = await db.findOneAsync({ group_id: groupId, user_id: userId });
        return participant;
    }
    async getParticipantsFromGroup(groupId) {
        const participants = await db.findAsync({ group_id: groupId });
        return participants;
    }
    async getAllParticipants() {
        const participants = await db.findAsync({});
        return participants;
    }
    async getParticipantsIdsFromGroup(groupId) {
        const participants = await this.getParticipantsFromGroup(groupId);
        return participants.map(participant => participant.user_id);
    }
    async getAdminsFromGroup(groupId) {
        const admins = await db.findAsync({ group_id: groupId, admin: true });
        return admins;
    }
    async getAdminsIdsFromGroup(groupId) {
        const admins = await db.findAsync({ group_id: groupId, admin: true });
        return admins.map(admin => admin.user_id);
    }
    async isGroupParticipant(groupId, userId) {
        const participantsIds = await this.getParticipantsIdsFromGroup(groupId);
        return participantsIds.includes(userId);
    }
    async isGroupAdmin(groupId, userId) {
        const adminsIds = await this.getAdminsIdsFromGroup(groupId);
        return adminsIds.includes(userId);
    }
    incrementParticipantActivity(groupId, userId, type, isCommand) {
        let incrementedUser = { msgs: 1 };
        if (isCommand) {
            incrementedUser.commands = 1;
        }
        switch (type) {
            case "conversation":
            case "extendedTextMessage":
                incrementedUser.text = 1;
                break;
            case "imageMessage":
                incrementedUser.image = 1;
                break;
            case "videoMessage":
                incrementedUser.video = 1;
                break;
            case "stickerMessage":
                incrementedUser.sticker = 1;
                break;
            case "audioMessage":
                incrementedUser.audio = 1;
                break;
            case "documentMessage":
                incrementedUser.other = 1;
                break;
        }
        return db.updateAsync({ group_id: groupId, user_id: userId }, { $inc: incrementedUser });
    }
    async getParticipantActivityLowerThan(group, num) {
        const inactives = await db.findAsync({ group_id: group.id, msgs: { $lt: num } }).sort({ msgs: -1 });
        return inactives;
    }
    async getParticipantsActivityRanking(group, qty) {
        let participantsLeaderboard = await db.findAsync({ group_id: group.id }).sort({ msgs: -1 });
        const qty_leaderboard = (qty > participantsLeaderboard.length) ? participantsLeaderboard.length : qty;
        return participantsLeaderboard.splice(0, qty_leaderboard);
    }
    addWarning(groupId, userId) {
        return db.updateAsync({ group_id: groupId, user_id: userId }, { $inc: { warnings: 1 } });
    }
    removeWarning(groupId, userId, currentWarnings) {
        return db.updateAsync({ group_id: groupId, user_id: userId }, { $set: { warnings: --currentWarnings } });
    }
    removeParticipantsWarnings(groupId) {
        return db.updateAsync({ group_id: groupId }, { $set: { warnings: 0 } });
    }
    async hasAntiFloodExpiredMessages(group, participant, currentTimestamp) {
        if (group && currentTimestamp > participant.antiflood.expire) {
            const expireTimestamp = currentTimestamp + (group === null || group === void 0 ? void 0 : group.antiflood.interval);
            await db.updateAsync({ group_id: group.id, user_id: participant.user_id }, { $set: { 'antiflood.expire': expireTimestamp, 'antiflood.msgs': 1 } });
            return true;
        }
        else {
            await db.updateAsync({ group_id: group.id, user_id: participant.user_id }, { $inc: { 'antiflood.msgs': 1 } });
            return false;
        }
    }
}
