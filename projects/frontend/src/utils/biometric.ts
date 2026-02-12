export const simulateBiometricAuth = async (): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate 90% success rate
            const success = Math.random() > 0.1;
            resolve(success);
        }, 2000);
    });
};

export const generateBiometricProof = async (userId: string): Promise<string> => {
    // In a real app, this would be a signed payload from a hardware authenticator.
    // We mock it with a simple hash-like string.
    return `biometric_proof_${userId}_${Date.now()}`;
};
