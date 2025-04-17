import { GroupService } from "../services/group.service.js";
import { ParticipantService } from "../services/participant.service.js";
export class GroupController {
    constructor() {
        this.groupService = new GroupService();
        this.participantService = new ParticipantService();
    }
    // *********************** OBTER DADOS DO GRUPO ***********************
    getGroup(groupId) {
        return this.groupService.getGroup(groupId);
    }
    isRegistered(groupId) {
        return this.groupService.isRegistered(groupId);
    }
    getOwner(groupId) {
        return this.groupService.getOwner(groupId);
    }
    isRestricted(groupId) {
        return this.groupService.isRestricted(groupId);
    }
    getAllGroups() {
        return this.groupService.getAllGroups();
    }
    // *********************** REGISTRA/REMOVE/ATUALIZA GRUPOS ***********************
    registerGroup(group) {
        return this.groupService.registerGroup(group);
    }
    rebuildGroups() {
        return this.groupService.rebuildGroups();
    }
    rebuildParticipants() {
        return this.participantService.rebuildParticipants();
    }
    setNameGroup(groupId, name) {
        return this.groupService.setName(groupId, name);
    }
    setRestrictedGroup(groupId, status) {
        return this.groupService.setRestricted(groupId, status);
    }
    syncGroups(groups) {
        return this.groupService.syncGroups(groups);
    }
    updatePartialGroup(group) {
        return this.groupService.updatePartialGroup(group);
    }
    removeGroup(groupId) {
        return this.groupService.removeGroup(groupId);
    }
    incrementGroupCommands(groupId) {
        return this.groupService.incrementGroupCommands(groupId);
    }
    // *********************** PARTICIPANTES/ADMINS ***********************
    getParticipant(groupId, userId) {
        return this.participantService.getParticipantFromGroup(groupId, userId);
    }
    getParticipants(groupId) {
        return this.participantService.getParticipantsFromGroup(groupId);
    }
    getParticipantsIds(groupId) {
        return this.participantService.getParticipantsIdsFromGroup(groupId);
    }
    getAdmins(groupId) {
        return this.participantService.getAdminsFromGroup(groupId);
    }
    getAdminsIds(groupId) {
        return this.participantService.getAdminsIdsFromGroup(groupId);
    }
    isParticipant(groupId, userId) {
        return this.participantService.isGroupParticipant(groupId, userId);
    }
    addParticipant(groupId, userId, isAdmin = false) {
        return this.participantService.addParticipant(groupId, userId, isAdmin);
    }
    addAdmin(groupId, userId) {
        return this.participantService.addAdmin(groupId, userId);
    }
    removeAdmin(groupId, userId) {
        return this.participantService.removeAdmin(groupId, userId);
    }
    isParticipantAdmin(groupId, userId) {
        return this.participantService.isGroupAdmin(groupId, userId);
    }
    removeParticipant(groupId, userId) {
        return this.participantService.removeParticipant(groupId, userId);
    }
    getParticipantsActivityLowerThan(group, num) {
        return this.participantService.getParticipantActivityLowerThan(group, num);
    }
    getParticipantsActivityRanking(group, num) {
        return this.participantService.getParticipantsActivityRanking(group, num);
    }
    incrementParticipantActivity(groupId, userId, type, isCommand) {
        return this.participantService.incrementParticipantActivity(groupId, userId, type, isCommand);
    }
    addParticipantWarning(groupId, userId) {
        return this.participantService.addWarning(groupId, userId);
    }
    removeParticipantWarning(groupId, userId, currentWarnings) {
        return this.participantService.removeWarning(groupId, userId, currentWarnings);
    }
    removeParticipantsWarnings(groupId) {
        return this.participantService.removeParticipantsWarnings(groupId);
    }
    hasParticipantExpiredMessages(group, participant, currentTimestamp) {
        return this.participantService.hasAntiFloodExpiredMessages(group, participant, currentTimestamp);
    }
    // *********************** Recursos do grupo ***********************
    // ***** FILTRO DE PALAVRAS *****
    addWordFilter(groupId, word) {
        return this.groupService.addWordFilter(groupId, word);
    }
    removeWordFilter(groupId, word) {
        return this.groupService.removeWordFilter(groupId, word);
    }
    // ***** BEM VINDO *****
    setWelcome(groupId, status, message = '') {
        return this.groupService.setWelcome(groupId, status, message);
    }
    // ***** ANTI-LINK *****
    setAntiLink(groupId, status = true) {
        return this.groupService.setAntilink(groupId, status);
    }
    // ***** AUTO-STICKER *****
    setAutoSticker(groupId, status = true) {
        return this.groupService.setAutosticker(groupId, status);
    }
    // ***** ANTI-FAKE *****
    setAntiFake(groupId, status = true, allowed) {
        return this.groupService.setAntifake(groupId, status, allowed);
    }
    isNumberFake(group, userId) {
        return this.groupService.isNumberFake(group, userId);
    }
    // ***** MUTAR GRUPO *****
    setMuted(groupId, status = true) {
        return this.groupService.setMuted(groupId, status);
    }
    // ***** ANTI-FLOOD *****
    setAntiFlood(groupId, status = true, maxMessages = 10, interval = 10) {
        return this.groupService.setAntiFlood(groupId, status, maxMessages, interval);
    }
    // ***** LISTA-NEGRA *****
    getBlackList(groupId) {
        return this.groupService.getBlackList(groupId);
    }
    addBlackList(groupId, userId) {
        return this.groupService.addBlackList(groupId, userId);
    }
    removeBlackList(groupId, userId) {
        return this.groupService.removeBlackList(groupId, userId);
    }
    isBlackListed(groupId, userId) {
        return this.groupService.isBlackListed(groupId, userId);
    }
    // ***** BLOQUEAR/DESBLOQUEAR COMANDOS *****
    blockCommands(group, commands, botInfo) {
        return this.groupService.blockCommands(group, commands, botInfo);
    }
    unblockCommands(group, commands, botInfo) {
        return this.groupService.unblockCommand(group, commands, botInfo);
    }
    isBlockedCommand(group, command, botInfo) {
        return this.groupService.isBlockedCommand(group, command, botInfo);
    }
}
