import React, { useState, useCallback, useEffect, useRef } from 'react';
import { getSlangDefinition, getSpeech } from './services/geminiService';
import { SlangDefinition } from './types';

// Type definitions for Speech Recognition API
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  // Adjusted to use a generic EventListener type for broader compatibility
  addEventListener: (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void;
  removeEventListener: (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) => void;
}

// Fix: Correctly define SpeechRecognition properties on the Window interface to resolve TypeScript errors.
interface Window {
  SpeechRecognition: { new(): SpeechRecognition };
  webkitSpeechRecognition: { new(): SpeechRecognition };
}


// --- AUDIO UTILITY FUNCTIONS ---

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


// --- SVG ICONS ---

const Logo: React.FC = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-cyan-400">
    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11 8C10.6163 8.63666 9.93264 9.4792 9 10C9.09915 10.5186 9.41689 11.2334 10 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 8C14.3837 8.63666 15.0674 9.4792 16 10C15.9008 10.5186 15.5831 11.2334 15 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SpeakerIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}> <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" /> <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" /> </svg> );

const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
        <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
    </svg>
);

const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
        <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
        <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.75 6.75 0 11-13.5 0v-1.5A.75.75 0 016 10.5z" />
    </svg>
);

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
);

const FilledStarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
);


// --- UI COMPONENTS ---

const PopularityMeter: React.FC<{ popularity: SlangDefinition['popularity'] }> = ({ popularity }) => {
    const popularityStyles = {
        'Trending Up': { width: '100%', color: 'bg-emerald-500', label: 'Trending Up' },
        'Established': { width: '75%', color: 'bg-sky-500', label: 'Established' },
        'Fading': { width: '40%', color: 'bg-amber-500', label: 'Fading' },
        'Niche': { width: '25%', color: 'bg-purple-500', label: 'Niche' },
    };
    const style = popularityStyles[popularity] || { width: '0%', color: 'bg-gray-500', label: 'Unknown' };

    return (
        <div>
            <span className="text-sm font-medium text-gray-400">{style.label}</span>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                <div className={`${style.color} h-2.5 rounded-full transition-all duration-500`} style={{ width: style.width }}></div>
            </div>
        </div>
    );
};

const ResultDisplay: React.FC<{
    term: string;
    definition: SlangDefinition;
    onPlayAudio: (text: string) => void;
    onStopAudio: () => void;
    isPlaying: boolean;
    onSelectRelated: (term: string) => void;
    isFavorite: boolean;
    onToggleFavorite: () => void;
}> = ({ term, definition, onPlayAudio, onStopAudio, isPlaying, onSelectRelated, isFavorite, onToggleFavorite }) => {
    const fullTextForSpeech = `${term}. Meaning: ${definition.meaning}. For example: ${definition.example}`;
    const vibeColor = 'bg-cyan-900/50 text-cyan-300';

    return (
        <div className="bg-gray-800/50 rounded-xl shadow-lg backdrop-blur-sm p-6 animate-fade-in">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-white capitalize">{term}</h2>
                    <div className={`inline-flex items-center px-3 py-1 mt-2 text-sm font-medium rounded-full ${vibeColor}`}>
                        {definition.vibe.formality}
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => isPlaying ? onStopAudio() : onPlayAudio(fullTextForSpeech)}
                        className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-700"
                        aria-label={isPlaying ? 'Stop audio' : 'Play audio'}
                    >
                        {isPlaying ? <StopIcon className="w-6 h-6 text-cyan-400" /> : <SpeakerIcon className="w-6 h-6" />}
                    </button>
                    <button
                        onClick={onToggleFavorite}
                        className="p-2 text-gray-400 hover:text-yellow-400 transition-colors rounded-full hover:bg-gray-700"
                        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        {isFavorite ? <FilledStarIcon className="w-6 h-6 text-yellow-400" /> : <StarIcon className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            <div className="mt-4 space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-cyan-400">Meaning</h3>
                    <p className="text-gray-300 mt-1">{definition.meaning}</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-cyan-400">Example</h3>
                    <p className="text-gray-300 mt-1 italic">"{definition.example}"</p>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold text-cyan-400">Vibe Check</h3>
                    <p className="text-gray-300 mt-1">{definition.vibe.description}</p>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold text-cyan-400">Origin</h3>
                    <p className="text-gray-300 mt-1">{definition.origin}</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-cyan-400">Popularity</h3>
                    <PopularityMeter popularity={definition.popularity} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-cyan-400">Related Terms</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {definition.relatedTerms.map(relatedTerm => (
                            <button
                                key={relatedTerm}
                                onClick={() => onSelectRelated(relatedTerm)}
                                className="px-3 py-1 bg-gray-700 hover:bg-cyan-500 text-gray-300 hover:text-white rounded-full text-sm transition-colors"
                            >
                                {relatedTerm}
                            </button>
                        ))}
                    </div>
                </div>
                {definition.oppositeTerms && definition.oppositeTerms.length > 0 && (
                  <div>
                      <h3 className="text-lg font-semibold text-cyan-400">Opposite in Meaning</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                          {definition.oppositeTerms.map(oppositeTerm => (
                              <button
                                  key={oppositeTerm}
                                  onClick={() => onSelectRelated(oppositeTerm)}
                                  className="px-3 py-1 bg-gray-700 hover:bg-rose-500 text-gray-300 hover:text-white rounded-full text-sm transition-colors"
                              >
                                  {oppositeTerm}
                              </button>
                          ))}
                      </div>
                  </div>
                )}
            </div>
        </div>
    );
};

const HistoryOrFavorites: React.FC<{
    items: string[];
    title: string;
    onSelect: (item: string) => void;
    onClear?: () => void;
}> = ({ items, title, onSelect, onClear }) => (
    <div className="bg-gray-800/50 rounded-xl shadow-lg p-6 animate-fade-in">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            {onClear && items.length > 0 && (
                <button onClick={onClear} className="text-sm text-cyan-400 hover:underline">Clear All</button>
            )}
        </div>
        {items.length > 0 ? (
            <ul className="mt-4 space-y-2">
                {items.map(item => (
                    <li key={item}>
                        <button onClick={() => onSelect(item)} className="w-full text-left p-2 rounded-md text-gray-300 hover:bg-gray-700 transition-colors">
                            {item}
                        </button>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-gray-500 mt-4">No {title.toLowerCase()} yet.</p>
        )}
    </div>
);

const SlangOfTheDay: React.FC<{ onSearch: (term: string) => void }> = ({ onSearch }) => {
    useEffect(() => {
        const terms = ['rizz', 'cap', 'based', 'GOAT', 'mid', 'no-life'];
        const today = new Date().toDateString();
        const storedDay = localStorage.getItem('slangOfDay_date');
        
        let term;
        if (storedDay === today) {
            term = localStorage.getItem('slangOfDay_term');
        } else {
            term = terms[Math.floor(Math.random() * terms.length)];
            localStorage.setItem('slangOfDay_date', today);
            localStorage.setItem('slangOfDay_term', term);
        }

        if (term) onSearch(term);
    }, [onSearch]);

    return (
        <div className="text-center p-6 bg-gray-800/50 rounded-xl">
             <h2 className="text-xl font-bold text-cyan-400">Slang of the Day</h2>
             <p className="text-gray-400 mt-2">Loading today's term...</p>
        </div>
    );
};


// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [definition, setDefinition] = useState<SlangDefinition | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    
    const [isListening, setIsListening] = useState<boolean>(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [favorites, setFavorites] = useState<Record<string, SlangDefinition>>({});
    const [activeTab, setActiveTab] = useState<'search' | 'history' | 'favorites'>('search');
    const [initialLoad, setInitialLoad] = useState<boolean>(true);


    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem('slangSearchHistory');
            if (storedHistory) setSearchHistory(JSON.parse(storedHistory));
            const storedFavorites = localStorage.getItem('slangFavorites');
            if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
        } catch (e) {
            console.error("Failed to load data from localStorage", e);
        }
    }, []);

    const handleSearch = useCallback(async (termToSearch: string) => {
        if (!termToSearch.trim()) return;

        setIsLoading(true);
        setError(null);
        setDefinition(null);
        setActiveTab('search');
        setInitialLoad(false);
        
        try {
            const result = await getSlangDefinition(termToSearch.trim().toLowerCase());
            setDefinition(result);
            // Update history
            setSearchHistory(prev => {
                const newHistory = [termToSearch.trim().toLowerCase(), ...prev.filter(t => t !== termToSearch.trim().toLowerCase())].slice(0, 10);
                localStorage.setItem('slangSearchHistory', JSON.stringify(newHistory));
                return newHistory;
            });
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handlePlayAudio = useCallback(async (text: string) => {
        if (isPlaying) audioSourceRef.current?.stop();
        setIsPlaying(true);
        try {
            const audioData = await getSpeech(text);
            const audioBytes = decode(audioData);

            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const ctx = audioContextRef.current;
            const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);

            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.start();
            source.onended = () => setIsPlaying(false);
            audioSourceRef.current = source;
        } catch (err: any) {
            console.error("Audio prefetch for chunk 0 failed:", err);
            setError("Failed to generate speech. " + err.message);
            setIsPlaying(false);
        }
    }, [isPlaying]);
    
    const handleStopAudio = useCallback(() => {
        audioSourceRef.current?.stop();
        setIsPlaying(false);
    }, []);

    const handleVoiceSearch = () => {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
            setError("Voice search is not supported by your browser.");
            return;
        }
        
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognitionRef.current = recognition;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript;
            setSearchTerm(transcript);
            handleSearch(transcript);
        };
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            setError(`Voice search error: ${event.error}`);
        };
        recognition.onend = () => {
            setIsListening(false);
        };
        
        recognition.start();
        setIsListening(true);
    };
    
    const handleSurpriseMe = useCallback(() => {
        const popularTerms = ['rizz', 'delulu', 'simp', 'pog', 'based', 'yeet', 'finna', 'bet', 'no cap'];
        const randomTerm = popularTerms[Math.floor(Math.random() * popularTerms.length)];
        setSearchTerm(randomTerm);
        handleSearch(randomTerm);
    }, [handleSearch]);

    const toggleFavorite = useCallback((term: string, def: SlangDefinition) => {
        setFavorites(prev => {
            const newFavorites = { ...prev };
            if (newFavorites[term]) {
                delete newFavorites[term];
            } else {
                newFavorites[term] = def;
            }
            localStorage.setItem('slangFavorites', JSON.stringify(newFavorites));
            return newFavorites;
        });
    }, []);

    return (
        <main className="bg-gray-900 min-h-screen text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto">
                <header className="flex flex-col items-center text-center mb-8">
                    <Logo />
                    <h1 className="text-4xl sm:text-5xl font-extrabold mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">SlangSupport</h1>
                    <p className="text-gray-400 mt-2 max-w-md">Your modern-day urban dictionary. Get the vibe on the latest slang.</p>
                </header>
                
                <div className="relative mb-6">
                    <form onSubmit={(e) => { e.preventDefault(); handleSearch(searchTerm); }}>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Type a slang term, e.g., 'rizz'"
                            className="w-full pl-4 pr-24 py-3 text-lg bg-gray-800 border-2 border-gray-700 rounded-full focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition"
                            aria-label="Search for a slang term"
                        />
                         <div className="absolute inset-y-0 right-2 flex items-center">
                            <button
                                type="button"
                                onClick={handleVoiceSearch}
                                className={`p-2 mr-1 rounded-full transition-colors ${isListening ? 'text-cyan-400 animate-pulse' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                                aria-label="Search with voice"
                            >
                                <MicrophoneIcon className="w-6 h-6" />
                            </button>
                            <button type="submit" className="px-4 py-2 text-base font-semibold text-white bg-cyan-600 rounded-full hover:bg-cyan-700 transition-colors">Search</button>
                        </div>
                    </form>
                    <button onClick={handleSurpriseMe} className="absolute -bottom-7 right-2 text-xs text-cyan-400 hover:underline">Surprise Me!</button>
                </div>
                
                 <div className="flex justify-center space-x-4 mb-8 border-b border-gray-700">
                    {['search', 'history', 'favorites'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
                        >
                            {tab === 'search' ? 'Result' : tab}
                        </button>
                    ))}
                </div>

                <div className="min-h-[300px]">
                    {isLoading && <div className="text-center p-8 text-gray-400">Loading...</div>}
                    {error && <div className="text-center p-8 text-red-400 bg-red-900/20 rounded-lg">{error}</div>}
                    
                    {activeTab === 'search' && !isLoading && !error && (
                         definition ? (
                            <ResultDisplay
                                term={searchTerm}
                                definition={definition}
                                onPlayAudio={handlePlayAudio}
                                onStopAudio={handleStopAudio}
                                isPlaying={isPlaying}
                                onSelectRelated={(term) => { setSearchTerm(term); handleSearch(term); }}
                                isFavorite={!!favorites[searchTerm.toLowerCase()]}
                                onToggleFavorite={() => toggleFavorite(searchTerm.toLowerCase(), definition)}
                            />
                        ) : (initialLoad && <SlangOfTheDay onSearch={(term) => { setSearchTerm(term); handleSearch(term); }} />)
                    )}

                    {activeTab === 'history' && (
                        <HistoryOrFavorites 
                            title="Search History"
                            items={searchHistory}
                            onSelect={(term) => { setSearchTerm(term); handleSearch(term); }}
                            onClear={() => { setSearchHistory([]); localStorage.removeItem('slangSearchHistory'); }}
                        />
                    )}

                    {activeTab === 'favorites' && (
                        <HistoryOrFavorites 
                            title="Favorites"
                            items={Object.keys(favorites)}
                            onSelect={(term) => { setSearchTerm(term); handleSearch(term); }}
                        />
                    )}
                </div>
            </div>
        </main>
    );
};

export default App;
