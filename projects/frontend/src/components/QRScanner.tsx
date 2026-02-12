import React, { useState } from 'react';
import { parseClaimQRData } from '../utils/qrUtils';

interface Props {
    onScan: (data: any) => void;
}

const QRScanner: React.FC<Props> = ({ onScan }) => {
    const [inputData, setInputData] = useState('');

    const handleSimulateScan = () => {
        const data = parseClaimQRData(inputData);
        if (data) {
            onScan(data);
        } else {
            alert("Invalid QR Data");
        }
    };

    return (
        <div className="card bg-base-200 p-4">
            <h3 className="font-bold mb-2">Offline Claim Scanner</h3>
            <p className="text-xs mb-2 opacity-70">Paste the Base64 QR code string below to simulate a scan.</p>
            <textarea
                className="textarea textarea-bordered w-full mb-2"
                placeholder="Paste QR Data here..."
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
            />
            <button className="btn btn-secondary btn-sm" onClick={handleSimulateScan}>
                Simulate Scan
            </button>
        </div>
    );
};

export default QRScanner;
