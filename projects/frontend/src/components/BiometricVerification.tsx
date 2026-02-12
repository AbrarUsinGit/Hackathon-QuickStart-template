import React, { useState, useRef } from 'react';

interface BiometricVerificationProps {
    onVerified: (success: boolean, method: string) => void;
    beneficiaryName?: string;
}

export const BiometricVerification: React.FC<BiometricVerificationProps> = ({
    onVerified,
    beneficiaryName,
}) => {
    const [verificationMethod, setVerificationMethod] = useState<string>('fingerprint');
    const [isVerifying, setIsVerifying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const startFacialRecognition = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }

            // Simulate facial recognition process
            setTimeout(() => {
                stopVideo();
                const success = Math.random() > 0.1; // 90% success rate for demo
                onVerified(success, 'facial');
                setIsVerifying(false);
            }, 3000);
        } catch (error) {
            console.error('Camera access denied:', error);
            onVerified(false, 'facial');
            setIsVerifying(false);
        }
    };

    const stopVideo = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const simulateFingerprint = () => {
        setIsVerifying(true);
        setTimeout(() => {
            const success = Math.random() > 0.05; // 95% success rate for demo
            onVerified(success, 'fingerprint');
            setIsVerifying(false);
        }, 2000);
    };

    const simulateIDScan = () => {
        setIsVerifying(true);
        setTimeout(() => {
            const success = Math.random() > 0.1; // 90% success rate for demo
            onVerified(success, 'id_scan');
            setIsVerifying(false);
        }, 2500);
    };

    const handleVerification = () => {
        switch (verificationMethod) {
            case 'fingerprint':
                simulateFingerprint();
                break;
            case 'facial':
                startFacialRecognition();
                break;
            case 'id_scan':
                simulateIDScan();
                break;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                    Biometric Verification Required
                </h3>
                {beneficiaryName && (
                    <p className="text-gray-600 mt-2">Beneficiary: {beneficiaryName}</p>
                )}
            </div>

            {/* Verification Method Selection */}
            <div className="flex justify-center space-x-4 mb-6">
                <button
                    onClick={() => setVerificationMethod('fingerprint')}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${verificationMethod === 'fingerprint'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                        />
                    </svg>
                    <span>Fingerprint</span>
                </button>

                <button
                    onClick={() => setVerificationMethod('facial')}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${verificationMethod === 'facial'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <span>Facial Recognition</span>
                </button>

                <button
                    onClick={() => setVerificationMethod('id_scan')}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${verificationMethod === 'id_scan'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                        />
                    </svg>
                    <span>ID Scan</span>
                </button>
            </div>

            {/* Facial Recognition Video */}
            {verificationMethod === 'facial' && (
                <div className="mb-6">
                    <video
                        ref={videoRef}
                        className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-300"
                        autoPlay
                        playsInline
                        muted
                    />
                </div>
            )}

            {/* Verification Button */}
            <div className="text-center">
                <button
                    onClick={handleVerification}
                    disabled={isVerifying}
                    className={`px-8 py-3 bg-green-600 text-white rounded-lg font-medium
            ${isVerifying ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'}
            transition-colors duration-200`}
                >
                    {isVerifying ? (
                        <span className="flex items-center space-x-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Verifying...</span>
                        </span>
                    ) : (
                        'Start Verification'
                    )}
                </button>
            </div>

            {/* Instructions */}
            <div className="mt-6 text-sm text-gray-600 border-t pt-4">
                <h4 className="font-medium mb-2">Verification Instructions:</h4>
                <ul className="list-disc list-inside space-y-1">
                    {verificationMethod === 'fingerprint' && (
                        <li>Place your finger on the biometric scanner</li>
                    )}
                    {verificationMethod === 'facial' && (
                        <>
                            <li>Ensure good lighting and face the camera</li>
                            <li>Remove glasses or face coverings if needed</li>
                        </>
                    )}
                    {verificationMethod === 'id_scan' && (
                        <>
                            <li>Place your government ID on the scanner</li>
                            <li>Ensure the document is clearly visible</li>
                        </>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default BiometricVerification;
