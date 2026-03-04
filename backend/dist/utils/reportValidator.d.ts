interface ValidationResult {
    isValid: boolean;
    validityScore: number;
    pointsDeduction: number;
    reasoning: string;
}
export declare const validateReportReason: (reason: string, description: string, wasteType?: string) => ValidationResult;
export declare const shouldAutoApprove: (reason: string, validityScore: number, pointsDeduction: number) => boolean;
export declare const getPointDeduction: (reason: string, validityScore: number, basePoints: number) => number;
export {};
//# sourceMappingURL=reportValidator.d.ts.map