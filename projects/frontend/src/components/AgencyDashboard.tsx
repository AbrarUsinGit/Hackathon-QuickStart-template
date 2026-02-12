import React, { useState } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { BenefitsClient } from '../contracts/Benefits';
import * as algokit from '@algorandfoundation/algokit-utils';
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs';

interface Props {
    openModal: boolean;
    closeModal: () => void;
}

const AgencyDashboard: React.FC<Props> = ({ openModal, closeModal }) => {
    const { activeAddress, transactionSigner } = useWallet();
    const [targetAddress, setTargetAddress] = useState('');
    const [amount, setAmount] = useState<number>(0);
    const [action, setAction] = useState<'issue' | 'clawback' | 'freeze'>('issue');
    const [status, setStatus] = useState('');

    const algodConfig = getAlgodConfigFromViteEnvironment();
    const algorand = algokit.AlgorandClient.fromConfig({ algodConfig });

    const APP_ID = 0; // REPLACE

    const handleExecute = async () => {
        if (!activeAddress || !APP_ID) return;
        setStatus('Processing...');

        try {
            const appClient = new BenefitsClient({
                appId: BigInt(APP_ID),
                algorand,
                defaultSigner: transactionSigner,
                defaultSender: activeAddress
            });

            if (action === 'clawback') {
                await appClient.send.clawbackBenefits({
                    args: {
                        target: targetAddress,
                        amount: BigInt(amount)
                    }
                });
                setStatus('Clawback Successful');
            } else {
                // Placeholder for other actions if added to contract
                setStatus('Action not yet implemented in demo');
            }
        } catch (e: any) {
            console.error(e);
            setStatus(`Error: ${e.message}`);
        }
    };

    if (!openModal) return null;

    return (
        <dialog id="agency_modal" className="modal modal-open">
            <div className="modal-box bg-white text-black">
                <h3 className="font-bold text-lg mb-4">Agency Dashboard</h3>

                <div className="form-control w-full mb-4">
                    <label className="label"><span className="label-text">Target User Address</span></label>
                    <input type="text" placeholder="Algorand Address" className="input input-bordered w-full" value={targetAddress} onChange={(e) => setTargetAddress(e.target.value)} />
                </div>

                <div className="form-control w-full mb-4">
                    <label className="label"><span className="label-text">Amount</span></label>
                    <input type="number" placeholder="Amount" className="input input-bordered w-full" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                </div>

                <div className="join w-full mb-4">
                    <input className="join-item btn" type="radio" name="options" aria-label="Issue" checked={action === 'issue'} onChange={() => setAction('issue')} />
                    <input className="join-item btn" type="radio" name="options" aria-label="Clawback" checked={action === 'clawback'} onChange={() => setAction('clawback')} />
                    <input className="join-item btn" type="radio" name="options" aria-label="Freeze" checked={action === 'freeze'} onChange={() => setAction('freeze')} />
                </div>

                <p className="text-sm text-center mb-4">{status}</p>

                <div className="modal-action">
                    <button className="btn btn-primary" onClick={handleExecute}>Execute</button>
                    <button className="btn" onClick={closeModal}>Close</button>
                </div>
            </div>
        </dialog>
    );
};

export default AgencyDashboard;
