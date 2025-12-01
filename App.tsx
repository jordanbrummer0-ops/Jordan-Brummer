import React, { useState, useEffect, useRef } from 'react';
import ChatInterface from './components/ChatInterface';
import GuideCard from './components/GuideCard';
import DisclaimerModal from './components/DisclaimerModal';
import LiveTechnicianModal from './components/LiveTechnicianModal';
import { STATIC_GUIDES, POPULAR_MODELS } from './constants';
import { AppView, Guide, DeviceModel } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredGuides, setFilteredGuides] = useState<Guide[]>(STATIC_GUIDES);
  
  // Device Selection State
  const [selectedDevice, setSelectedDevice] = useState<DeviceModel | null>(null);
  const [deviceSearch, setDeviceSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredGuides(STATIC_GUIDES);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredGuides(STATIC_GUIDES.filter(g => 
        g.title.toLowerCase().includes(lower) || 
        g.description.toLowerCase().includes(lower) ||
        g.miuiVersion.toLowerCase().includes(lower)
      ));
    }
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDisclaimerAccept = () => {
    setHasAcceptedDisclaimer(true);
  };

  const handleDeviceSelect = (device: DeviceModel) => {
    setSelectedDevice(device);
    setDeviceSearch(device.name);
    setIsDropdownOpen(false);
  };

  const filteredModels = POPULAR_MODELS.filter(m => 
    m.name.toLowerCase().includes(deviceSearch.toLowerCase()) ||
    m.code.toLowerCase().includes(deviceSearch.toLowerCase())
  );

  const renderContent = () => {
    if (!hasAcceptedDisclaimer) return null;

    switch (currentView) {
      case AppView.CHAT:
        return (
          <div className="h-[calc(100vh-140px)] w-full max-w-4xl mx-auto">
            <ChatInterface 
              selectedDevice={selectedDevice} 
              onOpenLive={() => setIsLiveModalOpen(true)}
            />
          </div>
        );
      case AppView.GUIDES:
        return (
          <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">FRP Bypass Guides</h2>
              {selectedDevice && (
                 <div className="mb-4 p-3 bg-mi-orange/10 border border-mi-orange/30 rounded-md text-sm text-mi-orange flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                   <span>Showing guides relevant for <strong>{selectedDevice.name}</strong></span>
                   <button onClick={() => setSelectedDevice(null)} className="ml-auto underline hover:text-white">Clear</button>
                 </div>
              )}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search guides (e.g., 'HyperOS', 'Keyboard')"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 text-white border border-slate-600 rounded-md py-2 pl-10 pr-4 focus:ring-1 focus:ring-mi-orange focus:border-mi-orange outline-none"
                />
                <svg className="absolute left-3 top-2.5 text-slate-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-1">
              {filteredGuides.length > 0 ? (
                filteredGuides.map(guide => (
                  <GuideCard key={guide.id} guide={guide} />
                ))
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <p>No guides found matching your search.</p>
                  <button onClick={() => setCurrentView(AppView.CHAT)} className="mt-2 text-mi-orange hover:underline">Ask the AI Assistant instead</button>
                </div>
              )}
            </div>
          </div>
        );
      case AppView.HOME:
      default:
        return (
          <div className="max-w-5xl mx-auto pb-20">
            <div className="text-center mb-12 pt-10">
              <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-mi-orange to-yellow-500 mb-4">
                MiUnlocker AI
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
                The advanced assistant for recovering lost access to Xiaomi, Redmi, and POCO devices.
              </p>

              {/* Device Selector */}
              <div className="max-w-xl mx-auto relative z-20" ref={dropdownRef}>
                <label className="block text-left text-sm font-medium text-slate-400 mb-2 ml-1">Identify your device</label>
                <div className="relative">
                  <input
                    type="text"
                    value={deviceSearch}
                    onChange={(e) => {
                      setDeviceSearch(e.target.value);
                      setIsDropdownOpen(true);
                      if (!e.target.value) setSelectedDevice(null);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="Search model (e.g. Redmi Note 12)..."
                    className="w-full bg-slate-900/80 backdrop-blur border border-slate-600 rounded-xl py-4 pl-12 pr-4 text-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-mi-orange focus:border-transparent outline-none shadow-lg transition-all"
                  />
                  <div className="absolute left-4 top-4.5 text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                  </div>
                  {selectedDevice && (
                    <div className="absolute right-4 top-4 text-green-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                </div>

                {isDropdownOpen && (
                  <div className="absolute w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600">
                    {filteredModels.length > 0 ? (
                      filteredModels.map((model) => (
                        <div
                          key={model.code}
                          onClick={() => handleDeviceSelect(model)}
                          className="px-4 py-3 hover:bg-slate-700 cursor-pointer flex justify-between items-center group transition-colors"
                        >
                          <div>
                            <div className="text-white font-medium group-hover:text-mi-orange transition-colors">{model.name}</div>
                            <div className="text-xs text-slate-500">Code: {model.code} • {model.chipset}</div>
                          </div>
                          {selectedDevice?.code === model.code && (
                            <span className="text-xs text-mi-orange font-bold px-2 py-1 bg-mi-orange/10 rounded">SELECTED</span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-slate-500">No models found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div 
                onClick={() => setCurrentView(AppView.CHAT)}
                className="group cursor-pointer bg-slate-800 p-8 rounded-xl border border-slate-700 hover:border-mi-orange transition-all hover:shadow-lg hover:shadow-mi-orange/10"
              >
                <div className="w-12 h-12 bg-mi-orange/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-mi-orange/20 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff6700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">AI Assistant</h3>
                <p className="text-slate-400">
                  {selectedDevice 
                    ? `Get tailored solutions for your ${selectedDevice.name}.`
                    : "Chat with our trained model to find specific bypass solutions."}
                </p>
                <span className="text-mi-orange text-sm font-medium mt-4 inline-block group-hover:translate-x-1 transition-transform">Start Chat &rarr;</span>
              </div>

              <div 
                onClick={() => setCurrentView(AppView.GUIDES)}
                className="group cursor-pointer bg-slate-800 p-8 rounded-xl border border-slate-700 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Static Guides</h3>
                <p className="text-slate-400">
                  Browse verified methods. {selectedDevice ? `(Filtered for ${selectedDevice.name})` : ""}
                </p>
                 <span className="text-blue-500 text-sm font-medium mt-4 inline-block group-hover:translate-x-1 transition-transform">Browse Database &rarr;</span>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Popular Supported Models</h3>
              <div className="flex flex-wrap gap-2">
                {POPULAR_MODELS.slice(0, 5).map((model) => (
                  <button 
                    key={model.code} 
                    onClick={() => handleDeviceSelect(model)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${selectedDevice?.code === model.code ? 'bg-mi-orange text-white border-mi-orange' : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'}`}
                  >
                    {model.name}
                  </button>
                ))}
                <span className="px-3 py-1 bg-slate-800 text-slate-500 rounded-full text-sm border border-slate-700">
                  + 100 more
                </span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-mi-dark to-slate-900 text-slate-200 font-sans selection:bg-mi-orange selection:text-white">
      {!hasAcceptedDisclaimer && <DisclaimerModal onAccept={handleDisclaimerAccept} />}
      {isLiveModalOpen && <LiveTechnicianModal onClose={() => setIsLiveModalOpen(false)} />}
      
      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView(AppView.HOME)}>
              <div className="w-8 h-8 bg-mi-orange rounded flex items-center justify-center font-bold text-white text-lg">M</div>
              <span className="font-bold text-xl tracking-tight text-white">MiUnlocker</span>
            </div>
            
            <nav className="flex gap-4">
              <button 
                onClick={() => setCurrentView(AppView.HOME)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === AppView.HOME ? 'text-mi-orange bg-slate-800' : 'text-slate-400 hover:text-white'}`}
              >
                Home
              </button>
              <button 
                onClick={() => setCurrentView(AppView.CHAT)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === AppView.CHAT ? 'text-mi-orange bg-slate-800' : 'text-slate-400 hover:text-white'}`}
              >
                AI Chat
              </button>
              <button 
                onClick={() => setCurrentView(AppView.GUIDES)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === AppView.GUIDES ? 'text-mi-orange bg-slate-800' : 'text-slate-400 hover:text-white'}`}
              >
                Guides
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;