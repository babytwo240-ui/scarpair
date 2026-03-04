"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNowManilla = exports.getNowUtc = exports.formatUtcToManillaDisplay = exports.utcToManillaLocalDate = exports.parseUserInputAsManillaTime = void 0;
const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000;
/**
 * @param dateTimeLocalString
 * @returns
 */
/**

 * @param dateTimeLocalString
 * @returns
 */
const parseUserInputAsManillaTime = (dateTimeLocalString) => {
    console.log('🔍 parseUserInputAsManillaTime DEBUG:');
    console.log('   Input string:', dateTimeLocalString);
    const [dateStr, timeStr] = dateTimeLocalString.split('T');
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    console.log('   Parsed components:');
    console.log('     Year:', year, 'Month:', month, 'Day:', day);
    console.log('     Hours:', hours, 'Minutes:', minutes);
    const dateAsUTC = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
    console.log('   Date as if UTC:', dateAsUTC.toISOString());
    const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000;
    const utcDate = new Date(dateAsUTC.getTime() - MANILA_OFFSET_MS);
    console.log('   After subtracting 8 hours (Manila→UTC):');
    console.log('   UTC Date:', utcDate.toISOString());
    return utcDate;
};
exports.parseUserInputAsManillaTime = parseUserInputAsManillaTime;
/**
 * @param utcDate
 * @returns
 */
const utcToManillaLocalDate = (utcDate) => {
    const utcAsDate = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
    return new Date(utcAsDate.getTime() + MANILA_OFFSET_MS);
};
exports.utcToManillaLocalDate = utcToManillaLocalDate;
/**
 * @param utcDate
 * @returns
 */
const formatUtcToManillaDisplay = (utcDate) => {
    if (!utcDate)
        return '';
    const utcAsDate = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
    if (isNaN(utcAsDate.getTime()))
        return String(utcDate);
    const manilaDate = new Date(utcAsDate.getTime() + MANILA_OFFSET_MS);
    const year = manilaDate.getUTCFullYear();
    const month = String(manilaDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(manilaDate.getUTCDate()).padStart(2, '0');
    const hours = manilaDate.getUTCHours();
    const minutes = String(manilaDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(manilaDate.getUTCSeconds()).padStart(2, '0');
    const meridiem = hours >= 12 ? 'PM' : 'AM';
    const displayHours = String(hours % 12 || 12).padStart(2, '0');
    return `${month}/${day}/${year}, ${displayHours}:${minutes}:${seconds} ${meridiem}`;
};
exports.formatUtcToManillaDisplay = formatUtcToManillaDisplay;
/**
 * @returns
 */
const getNowUtc = () => {
    return new Date();
};
exports.getNowUtc = getNowUtc;
/**
 * @returns
 */
const getNowManilla = () => {
    return new Date(Date.now() + MANILA_OFFSET_MS);
};
exports.getNowManilla = getNowManilla;
exports.default = {
    parseUserInputAsManillaTime: exports.parseUserInputAsManillaTime,
    utcToManillaLocalDate: exports.utcToManillaLocalDate,
    formatUtcToManillaDisplay: exports.formatUtcToManillaDisplay,
    getNowUtc: exports.getNowUtc,
    getNowManilla: exports.getNowManilla,
    MANILA_OFFSET_MS
};
//# sourceMappingURL=philippineTimeUtil.js.map