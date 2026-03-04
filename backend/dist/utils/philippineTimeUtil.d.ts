/**
 * @param dateTimeLocalString
 * @returns
 */
/**

 * @param dateTimeLocalString
 * @returns
 */
export declare const parseUserInputAsManillaTime: (dateTimeLocalString: string) => Date;
/**
 * @param utcDate
 * @returns
 */
export declare const utcToManillaLocalDate: (utcDate: Date | string) => Date;
/**
 * @param utcDate
 * @returns
 */
export declare const formatUtcToManillaDisplay: (utcDate: Date | string | null | undefined) => string;
/**
 * @returns
 */
export declare const getNowUtc: () => Date;
/**
 * @returns
 */
export declare const getNowManilla: () => Date;
declare const _default: {
    parseUserInputAsManillaTime: (dateTimeLocalString: string) => Date;
    utcToManillaLocalDate: (utcDate: Date | string) => Date;
    formatUtcToManillaDisplay: (utcDate: Date | string | null | undefined) => string;
    getNowUtc: () => Date;
    getNowManilla: () => Date;
    MANILA_OFFSET_MS: number;
};
export default _default;
//# sourceMappingURL=philippineTimeUtil.d.ts.map