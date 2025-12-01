import React, { useState, useEffect } from 'react';

interface DisclaimerModalProps {
  onAccept: () => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onAccept }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleAccept = () => {
    setIsOpen(false);
    onAccept();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-mi-orange/50 rounded-lg max-w-lg w-full shadow-2xl shadow-mi-orange/10 transform transition-all">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M3.62 19A2 2 0 0 0 5.38 21h13.24a2 2 0 0 0 1.76-2L18.62 5A2 2 0 0 0 16.86 3H7.14a2 2 0 0 0-1.76 2L3.62 19z"/></svg>
            <h2 className="text-xl font-bold text-white">Important Disclaimer</h2>
          </div>
          
          <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
            <p>
              <strong>MiUnlocker AI</strong> is an educational tool designed to assist legitimate device owners who have lost access to their accounts or device credentials.
            </p>
            <p>
              Bypassing security measures (FRP) on devices you do not own or have permission to access may be illegal in your jurisdiction.
            </p>
            <p className="bg-red-900/20 border-l-4 border-red-500 p-3 italic">
              By continuing, you certify that you are the legal owner of the device you are attempting to unlock and accept full responsibility for your actions.
            </p>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleAccept}
              className="px-6 py-2 bg-mi-orange hover:bg-orange-600 text-white font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              I Understand & Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;