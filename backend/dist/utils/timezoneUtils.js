"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.now = exports.formatManila = exports.utcToManila = exports.manilaToUTC = void 0;
const MANILA_TIMEZONE_OFFSET = 8 * 60 * 60 * 1000;
const manilaToUTC = (manilaTimeString) => {
    const manilaDate = new Date(manilaTimeString);
    const utcDate = new Date(manilaDate.getTime() - MANILA_TIMEZONE_OFFSET);
    return utcDate;
};
exports.manilaToUTC = manilaToUTC;
const utcToManila = (utcDate) => {
    if (!utcDate)
        return '';
    const manilaDate = new Date(utcDate.getTime() + MANILA_TIMEZONE_OFFSET);
    return manilaDate.toISOString().replace('Z', '');
};
exports.utcToManila = utcToManila;
const formatManila = (utcDate) => {
    if (!utcDate)
        return '';
    const manilaDate = new Date(utcDate.getTime() + MANILA_TIMEZONE_OFFSET);
    return manilaDate.toLocaleString('en-PH', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'Asia/Manila'
    });
};
exports.formatManila = formatManila;
const now = () => {
    return new Date();
};
exports.now = now;
exports.default = {
    manilaToUTC: exports.manilaToUTC,
    utcToManila: exports.utcToManila,
    formatManila: exports.formatManila,
    now: exports.now,
    MANILA_TIMEZONE_OFFSET
};
//# sourceMappingURL=timezoneUtils.js.map