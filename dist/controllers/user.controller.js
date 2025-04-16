import { UserService } from "../services/user.service.js";
export class UserController {
    constructor() {
        this.userService = new UserService();
    }
    registerUser(userId, name) {
        return this.userService.registerUser(userId, name);
    }
    rebuildUsers() {
        return this.userService.rebuildUsers();
    }
    setName(userId, name) {
        return this.userService.setName(userId, name);
    }
    isUserRegistered(userId) {
        return this.userService.isUserRegistered(userId);
    }
    promoteUser(userId) {
        return this.userService.setAdmin(userId, true);
    }
    demoteUser(userId) {
        return this.userService.setAdmin(userId, false);
    }
    registerOwner(userId) {
        return this.userService.setOwner(userId);
    }
    getUsers() {
        return this.userService.getUsers();
    }
    getUser(userId) {
        return this.userService.getUser(userId);
    }
    getOwner() {
        return this.userService.getOwner();
    }
    getAdmins() {
        return this.userService.getAdmins();
    }
    setReceivedWelcome(userId, status = true) {
        return this.userService.setReceivedWelcome(userId, status);
    }
    increaseUserCommandsCount(userId) {
        return this.userService.increaseUserCommandsCount(userId);
    }
    async hasExpiredCommands(user, currentTimestamp) {
        return this.userService.hasExpiredCommands(user, currentTimestamp);
    }
    async hasExpiredLimited(user, botInfo, currentTimestamp) {
        return this.userService.hasExpiredLimited(user, botInfo, currentTimestamp);
    }
    setLimitedUser(userId, isLimited, botInfo, currentTimestamp) {
        return this.userService.setLimitedUser(userId, isLimited, botInfo, currentTimestamp);
    }
}
