import DataStore from "@seald-io/nedb";
import moment from "moment";
const db = new DataStore({ filename: './storage/users.db', autoload: true });
export class UserService {
    async getUser(userId) {
        const user = await db.findOneAsync({ id: userId });
        return user;
    }
    async getUsers() {
        const users = await db.findAsync({});
        return users;
    }
    async registerUser(userId, name) {
        const isRegistered = await this.isUserRegistered(userId);
        if (isRegistered) {
            return;
        }
        const timestamp = Math.round(moment.now() / 1000);
        const user = {
            id: userId,
            name,
            commands: 0,
            receivedWelcome: false,
            owner: false,
            admin: false,
            command_rate: {
                limited: false,
                expire_limited: 0,
                cmds: 1,
                expire_cmds: timestamp + 60
            }
        };
        return db.insertAsync(user);
    }
    async rebuildUsers() {
        var _a, _b, _c, _d;
        const users = await this.getUsers();
        for (let user of users) {
            const timestamp = Math.round(moment.now() / 1000);
            const oldUserData = user;
            const updatedUserData = {
                id: oldUserData.id,
                name: oldUserData.name,
                commands: oldUserData.commands,
                receivedWelcome: oldUserData.receivedWelcome,
                owner: oldUserData.owner,
                admin: oldUserData.admin,
                command_rate: {
                    limited: (_a = oldUserData.command_rate.limited) !== null && _a !== void 0 ? _a : false,
                    expire_limited: (_b = oldUserData.command_rate.expire_limited) !== null && _b !== void 0 ? _b : 0,
                    cmds: (_c = oldUserData.command_rate.cmds) !== null && _c !== void 0 ? _c : 1,
                    expire_cmds: (_d = oldUserData.command_rate.expire_cmds) !== null && _d !== void 0 ? _d : timestamp + 60
                }
            };
            await db.removeAsync({ id: user.id }, {});
            await db.insertAsync(updatedUserData);
        }
    }
    async isUserRegistered(userId) {
        const user = await this.getUser(userId);
        return (user != null);
    }
    setAdmin(userId, admin) {
        return db.updateAsync({ id: userId }, { $set: { admin } });
    }
    async getAdmins() {
        const admins = await db.findAsync({ admin: true });
        return admins;
    }
    setOwner(userId) {
        return db.updateAsync({ id: userId }, { $set: { owner: true, admin: true } });
    }
    async getOwner() {
        const owner = await db.findOneAsync({ owner: true });
        return owner;
    }
    setName(userId, name) {
        return db.updateAsync({ id: userId }, { $set: { name } });
    }
    setReceivedWelcome(userId, status = true) {
        return db.updateAsync({ id: userId }, { $set: { receivedWelcome: status } });
    }
    increaseUserCommandsCount(userId) {
        return db.updateAsync({ id: userId }, { $inc: { commands: 1 } });
    }
    async hasExpiredCommands(user, currentTimestamp) {
        if (currentTimestamp > user.command_rate.expire_cmds) {
            const expireTimestamp = currentTimestamp + 60;
            await db.updateAsync({ id: user.id }, { $set: { 'command_rate.expire_cmds': expireTimestamp, 'command_rate.cmds': 1 } });
            return true;
        }
        else {
            await db.updateAsync({ id: user.id }, { $inc: { "command_rate.cmds": 1 } });
            return false;
        }
    }
    async hasExpiredLimited(user, botInfo, currentTimestamp) {
        if (currentTimestamp > user.command_rate.expire_limited) {
            await this.setLimitedUser(user.id, false, botInfo, currentTimestamp);
            return true;
        }
        else {
            return false;
        }
    }
    setLimitedUser(userId, isLimited, botInfo, currentTimestamp) {
        if (isLimited) {
            return db.updateAsync({ id: userId }, { $set: { 'command_rate.limited': isLimited, 'command_rate.expire_limited': currentTimestamp + botInfo.command_rate.block_time } });
        }
        else {
            return db.updateAsync({ id: userId }, { $set: { 'command_rate.limited': isLimited, 'command_rate.expire_limited': 0, 'command_rate.cmds': 1, 'command_rate.expire_cmds': currentTimestamp + 60 } });
        }
    }
}
