import React, { useState } from 'react';
import { simulateBiometricAuth, generateBiometricProof } from '../utils/biometric';

interface Props {
    onSuccess: (proof: string) => void;
    userId: string;
}

const BiometricVerification: React.FC<Props> = ({ onSuccess, userId }) => {
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startVerification = async () => {
        setVerifying(true);
        setError(null);
        try {
            const success = await simulateBiometricAuth();
            if (success) {
                const proof = await generateBiometricProof(userId);
                onSuccess(proof);
            } else {
                setError("Biometric verification failed. Please try again.");
            }
        } catch {
            setError("An unexpected error occurred.");
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="card bg-base-100 shadow-xl border border-primary/20 p-6 max-w-sm mx-auto">
            <h3 className="text-lg font-bold mb-4 text-center">Identity Verification</h3>
            <div className="flex flex-col items-center gap-4">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${verifying ? 'animate-pulse border-yellow-400' : 'border-primary'}`}>
                    <span className="text-4xl">👆</span>
                </div>

                {error && <p className="text-error text-sm text-center">{error}</p>}

                <button
                    onClick={startVerification}
                    disabled={verifying}
                    className="btn btn-primary w-full"
                >
                    {verifying ? 'Scanning...' : 'Verify Identity'}
                </button>
            </div>
        </div>
    );
};

export default BiometricVerification;
