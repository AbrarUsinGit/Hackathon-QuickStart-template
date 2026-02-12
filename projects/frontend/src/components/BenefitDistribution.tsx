import React, { useState } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { BenefitsClient } from '../contracts/Benefits';
import * as algokit from '@algorandfoundation/algokit-utils';
import BiometricVerification from './BiometricVerification';
import QRScanner from './QRScanner';
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs';
import algosdk from 'algosdk';

interface Props {
    openModal: boolean;
    closeModal: () => void;
}

const BenefitDistribution: React.FC<Props> = ({ openModal, closeModal }) => {
    const { activeAddress, transactionSigner } = useWallet();
    const [step, setStep] = useState<'idle' | 'scan' | 'verify' | 'claiming'>('idle');
    const [claimData, setClaimData] = useState<any>(null);
    const [status, setStatus] = useState<string>('');

    const algodConfig = getAlgodConfigFromViteEnvironment();
    const algorand = algokit.AlgorandClient.fromConfig({ algodConfig });

    // Todo: Fetch actual App ID from config or discover it. For demo, we might need to look it up or hardcode.
    // Ideally passed as prop or context.
    const APP_ID = 0; // REPLACE WITH ACTUAL APP ID AFTER DEPLOYMENT

    const handleQRScan = (data: any) => {
        setClaimData(data);
        setStep('verify');
        setStatus('QR Code Scanned. Please verify identity.');
    };

    const handleBiometricSuccess = async (proof: string) => {
        setStep('claiming');
        setStatus('Identity Verified. Processing Claim...');

        if (!activeAddress || !APP_ID) {
            setStatus('Error: Wallet not connected or App ID missing.');
            return;
        }

        try {
            const appClient = new BenefitsClient({
                appId: BigInt(APP_ID),
                algorand,
                defaultSigner: transactionSigner,
                defaultSender: activeAddress
            });

            // Call smart contract to claim
            // Note: Real contract would verify the proof and claim data signature
            await appClient.send.claimBenefits({
                args: {
                    beneficiary: activeAddress,
                    biometricProof: proof
                }
            });

            setStatus('Success! Benefits Disbursed.');
            setTimeout(() => {
                closeModal();
                setStep('idle');
            }, 3000);

        } catch (e: any) {
            console.error(e);
            setStatus(`Error: ${e.message}`);
            setStep('idle');
        }
    };

    if (!openModal) return null;

    return (
        <dialog id="benefit_modal" className="modal modal-open">
            <div className="modal-box bg-white text-black">
                <h3 className="font-bold text-lg mb-4">Claim Government Benefits</h3>

                {step === 'idle' && (
                    <div className="flex flex-col gap-4">
                        <button className="btn btn-primary" onClick={() => setStep('scan')}>
                            Scan Offline QR Code
                        </button>
                        <button className="btn btn-secondary" onClick={() => setStep('verify')}>
                            Claim Online (Biometric)
                        </button>
                    </div>
                )}

                {step === 'scan' && (
                    <QRScanner onScan={handleQRScan} />
                )}

                {step === 'verify' && (
                    <BiometricVerification userId={activeAddress || ''} onSuccess={handleBiometricSuccess} />
                )}

                {step === 'claiming' && (
                    <div className="flex flex-col items-center justify-center p-8">
                        <span className="loading loading-spinner loading-lg"></span>
                        <p className="mt-4 text-center">{status}</p>
                    </div>
                )}

                <div className="modal-action">
                    <button className="btn" onClick={closeModal}>Close</button>
                </div>
            </div>
        </dialog>
    );
};

export default BenefitDistribution;
