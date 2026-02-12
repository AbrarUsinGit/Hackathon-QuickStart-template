import React, { useState, useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { BenefitsClient } from '../contracts/Benefits';
import { AlgorandClient } from '@algorandfoundation/algokit-utils';
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs';

interface Beneficiary {
    address: string;
    name: string;
    idNumber: string;
    isActive: boolean;
    benefitAmount: number;
    disbursedAmount: number;
    lastDisbursement: number;
    guardianAddress: string;
}

interface Props {
    openModal: boolean;
    closeModal: () => void;
}

export const GovernmentBenefitsDistribution: React.FC<Props> = ({ openModal, closeModal }) => {
    const { activeAddress, transactionSigner } = useWallet();
    const [algorand, setAlgorand] = useState<AlgorandClient | null>(null);
    const [client, setClient] = useState<BenefitsClient | null>(null);
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [isAgency, setIsAgency] = useState(false);
    const [disasterMode, setDisasterMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [qrData, setQrData] = useState<string>('');

    // Initialize Algorand client
    useEffect(() => {
        const init = async () => {
            const algodConfig = getAlgodConfigFromViteEnvironment();
            const algorandInstance = AlgorandClient.fromConfig({ algodConfig });
            setAlgorand(algorandInstance);

            if (activeAddress && transactionSigner) {
                const APP_ID = Number(process.env.VITE_APP_ID || 0);

                if (APP_ID > 0) {
                    const appClient = new BenefitsClient({
                        appId: BigInt(APP_ID),
                        algorand: algorandInstance,
                        defaultSigner: transactionSigner,
                        defaultSender: activeAddress,
                    });
                    setClient(appClient);

                    // Check if current address is authorized agency
                    // For demo, we'll assume admin is the authorized agency
                    setIsAgency(true); // In production, check against contract state
                }
            }
        };
        init();
    }, [activeAddress, transactionSigner]);

    // Register new beneficiary
    const registerBeneficiary = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!client || !activeAddress) return;

        setLoading(true);
        try {
            const formData = new FormData(e.target as HTMLFormElement);

            // In the actual contract, you'd call a registerBeneficiary method
            // For now, this is a placeholder showing the intended flow
            alert('Beneficiary registration feature - connect to actual smart contract method');

            await loadBeneficiaries();
            (e.target as HTMLFormElement).reset();
        } catch (error) {
            console.error('Registration failed:', error);
            alert('Failed to register beneficiary: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    // Disburse benefits with biometric verification simulation
    const disburseBenefits = async (selectedBeneficiaries: string[]) => {
        if (!client || !selectedBeneficiaries.length) return;

        // Simulate biometric verification
        const biometricVerified = await simulateBiometricVerification();
        if (!biometricVerified) {
            alert('Biometric verification failed');
            return;
        }

        setLoading(true);
        try {
            // Call actual contract method for each beneficiary
            for (const beneficiary of selectedBeneficiaries) {
                await client.send.claimBenefits({
                    args: {
                        beneficiary,
                        biometricProof: `verified_${Date.now()}`
                    }
                });
            }

            alert(`Benefits disbursed to ${selectedBeneficiaries.length} beneficiaries!`);
            await loadBeneficiaries();
        } catch (error) {
            console.error('Disbursement failed:', error);
            alert('Failed to disburse benefits: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    // Simulate biometric verification
    const simulateBiometricVerification = async (): Promise<boolean> => {
        return new Promise((resolve) => {
            const verified = window.confirm('Confirm biometric verification?');
            resolve(verified);
        });
    };

    // Generate QR code for offline disbursement
    const generateQRCode = (beneficiary: Beneficiary) => {
        const qrPayload = JSON.stringify({
            type: 'benefit_disbursement',
            beneficiary: beneficiary.address,
            amount: beneficiary.benefitAmount,
            timestamp: Date.now(),
            agency: activeAddress,
        });
        setQrData(qrPayload);
    };

    // Toggle beneficiary freeze status
    const toggleBeneficiaryStatus = async (beneficiary: string, active: boolean) => {
        if (!client) return;

        setLoading(true);
        try {
            // Call contract freeze/unfreeze method
            alert(`Beneficiary ${!active ? 'activation' : 'freeze'} - connect to contract`);
            await loadBeneficiaries();
        } catch (error) {
            console.error('Status toggle failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // Clawback stolen benefits
    const clawbackBenefits = async (beneficiary: string, amount: number) => {
        if (!client || !activeAddress) return;

        setLoading(true);
        try {
            await client.send.clawbackBenefits({
                args: {
                    target: beneficiary,
                    amount: BigInt(amount),
                }
            });

            alert(`Recovered ${amount} benefits`);
            await loadBeneficiaries();
        } catch (error) {
            console.error('Clawback failed:', error);
            alert('Clawback failed: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    // Load beneficiaries (mock data for demo)
    const loadBeneficiaries = async () => {
        // In production, fetch from indexer or contract state
        setBeneficiaries([
            {
                address: 'SAMPLE1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                name: 'John Doe',
                idNumber: 'ID-001',
                isActive: true,
                benefitAmount: 1000,
                disbursedAmount: 3000,
                lastDisbursement: Date.now() / 1000 - 86400 * 30,
                guardianAddress: 'GUARDIAN1234567890ABCDEFGHIJKLMNOPQRST',
            },
        ]);
    };

    useEffect(() => {
        if (client && openModal) {
            loadBeneficiaries();
        }
    }, [client, openModal]);

    if (!openModal) return null;

    return (
        <dialog className={`modal ${openModal ? 'modal-open' : ''} bg-slate-200`}>
            <div className="modal-box max-w-6xl">
                <h1 className="text-2xl font-bold mb-6">Government Benefits Distribution</h1>

                {!isAgency ? (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
                        <p className="text-yellow-700">
                            You are not an authorized aid agency. Please contact system administrator.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Disaster Mode Toggle */}
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={disasterMode}
                                    onChange={(e) => setDisasterMode(e.target.checked)}
                                    className="checkbox checkbox-primary"
                                />
                                <span className="text-lg font-medium">Disaster/Emergency Mode</span>
                            </label>
                        </div>

                        {/* Registration Form */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Register New Beneficiary</h2>
                            <form onSubmit={registerBeneficiary} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        name="name"
                                        placeholder="Full Name"
                                        className="input input-bordered"
                                        required
                                    />
                                    <input
                                        name="idNumber"
                                        placeholder="National ID / Beneficiary ID"
                                        className="input input-bordered"
                                        required
                                    />
                                    <input
                                        name="address"
                                        placeholder="Algorand Wallet Address"
                                        className="input input-bordered font-mono"
                                        required
                                    />
                                    <input
                                        name="guardianAddress"
                                        placeholder="Guardian/Recovery Address"
                                        className="input input-bordered font-mono"
                                        required
                                    />
                                    <input
                                        name="benefitAmount"
                                        type="number"
                                        placeholder="Monthly Benefit Amount"
                                        className="input input-bordered"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary"
                                >
                                    {loading ? 'Processing...' : 'Register Beneficiary'}
                                </button>
                            </form>
                        </div>

                        {/* Beneficiaries Table */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Registered Beneficiaries</h2>
                            <div className="overflow-x-auto">
                                <table className="table table-zebra w-full">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Status</th>
                                            <th>Benefit Amount</th>
                                            <th>Disbursed Total</th>
                                            <th>Last Disbursement</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {beneficiaries.map((beneficiary) => (
                                            <tr key={beneficiary.address}>
                                                <td>
                                                    <div className="font-medium">{beneficiary.name}</div>
                                                    <div className="text-sm text-gray-500 font-mono">
                                                        {beneficiary.address.slice(0, 8)}...
                                                    </div>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`badge ${beneficiary.isActive ? 'badge-success' : 'badge-error'
                                                            }`}
                                                    >
                                                        {beneficiary.isActive ? 'Active' : 'Frozen'}
                                                    </span>
                                                </td>
                                                <td>{beneficiary.benefitAmount}</td>
                                                <td>{beneficiary.disbursedAmount}</td>
                                                <td>
                                                    {beneficiary.lastDisbursement
                                                        ? new Date(beneficiary.lastDisbursement * 1000).toLocaleDateString()
                                                        : 'Never'}
                                                </td>
                                                <td className="space-x-2">
                                                    <button
                                                        onClick={() => toggleBeneficiaryStatus(beneficiary.address, beneficiary.isActive)}
                                                        className={`btn btn-xs ${beneficiary.isActive ? 'btn-error' : 'btn-success'
                                                            }`}
                                                    >
                                                        {beneficiary.isActive ? 'Freeze' : 'Activate'}
                                                    </button>
                                                    <button
                                                        onClick={() => generateQRCode(beneficiary)}
                                                        className="btn btn-xs btn-info"
                                                    >
                                                        QR
                                                    </button>
                                                    <button
                                                        onClick={() => clawbackBenefits(beneficiary.address, 1000)}
                                                        className="btn btn-xs btn-warning"
                                                    >
                                                        Clawback
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mass Disbursement */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Mass Disbursement</h2>
                            <p className="text-sm text-gray-600 mb-4">
                                Selected beneficiaries will receive their benefits via atomic transfer
                            </p>
                            <button
                                onClick={() => disburseBenefits(beneficiaries.map(b => b.address))}
                                disabled={loading}
                                className="btn btn-primary"
                            >
                                {loading ? 'Processing...' : 'Disburse to All Beneficiaries'}
                            </button>
                        </div>

                        {/* QR Code Display */}
                        {qrData && (
                            <div className="bg-white shadow-md rounded-lg p-6 text-center">
                                <h2 className="text-xl font-semibold mb-4">Offline Disbursement QR Code</h2>
                                <div className="flex justify-center mb-4">
                                    <div className="p-4 bg-white border-2 border-gray-300">
                                        <p className="font-mono text-xs break-all">{qrData}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">
                                    Scan with beneficiary wallet for offline disbursement
                                </p>
                                <button
                                    onClick={() => setQrData('')}
                                    className="btn btn-ghost"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="modal-action">
                    <button onClick={closeModal} className="btn">
                        Close
                    </button>
                </div>
            </div>
        </dialog>
    );
};

export default GovernmentBenefitsDistribution;
