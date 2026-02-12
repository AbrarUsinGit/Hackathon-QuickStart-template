import { Buffer } from 'buffer';

export interface ClaimData {
    beneficiary: string;
    amount: number;
    timestamp: number;
    signature: string;
}

export const generateClaimQRData = (claim: ClaimData): string => {
    const json = JSON.stringify(claim);
    return Buffer.from(json).toString('base64');
};

export const parseClaimQRData = (qrString: string): ClaimData | null => {
    try {
        const json = Buffer.from(qrString, 'base64').toString('utf-8');
        return JSON.parse(json);
    } catch (e) {
        console.error("Invalid QR Data", e);
        return null;
    }
};
