import React, { useState, useCallback, useEffect, useRef } from 'react';
import { getSlangDefinition, getSpeech } from './services/geminiService';
import { SlangDefinition } from './types';

// FIX: Update type definitions for the Web Speech API to use addEventListener
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

interface SpeechRecognition {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  addEventListener: (type: 'result' | 'error' | 'end', listener: (event: any) => void) => void;
  removeEventListener: (type: 'result' | 'error' | 'end', listener: (event: any) => void) => void;
}


// --- Audio Helper Functions from Gemini Docs ---
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
// ---------------------------------------------


const Logo: React.FC = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-cyan-400">
    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11 8C10.6163 8.63666 9.93264 9.4792 9 10C9.09915 10.5186 9.41689 11.2334 10 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 8C14.3837 8.63666 15.0674 9.4792 16 10C15.9008 10.5186 15.5831 11.2334 15 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SpeakerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
        <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
    </svg>
);

const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
        <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
    </svg>
);

const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
      <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
      <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.75 6.75 0 11-13.5 0v-1.5A.75.75 0 016 10.5z" />
      <path d="M12 18.75a.75.75 0 01.75.75v.008a.75.75 0 01-1.5 0V19.5a.75.75 0 01.75-.75z" />
    </svg>
);

const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-4.991-2.696a8.25 8.25 0 00-11.664 0l-3.181 3.183" />
    </svg>
);


interface InputFormProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSubmit: (event: React.FormEvent) => void;
  isLoading: boolean;
  isListening: boolean;
  onMicClick: () => void;
  micSupported: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ searchTerm, setSearchTerm, handleSubmit, isLoading, isListening, onMicClick, micSupported }) => (
  <form onSubmit={handleSubmit} className="w-full max-w-2xl flex flex-col sm:flex-row gap-3">
    <div className="relative flex-grow w-full">
        <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isListening ? "Listening..." : "e.g., 'rizz', 'iykyk', 'based'"}
            className="w-full px-4 py-3 sm:px-5 text-base sm:text-lg text-white bg-gray-800 border-2 border-gray-700 rounded-full focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none transition-all duration-300 placeholder-gray-500 pr-12 sm:pr-14"
            disabled={isLoading || isListening}
        />
        {micSupported && (
            <button
            type="button"
            onClick={onMicClick}
            disabled={isLoading}
            className={`absolute top-1/2 right-2 transform -translate-y-1/2 p-2 rounded-full text-gray-400 hover:text-cyan-400 transition-all duration-300 focus:outline-none disabled:text-gray-600 disabled:cursor-not-allowed ${isListening ? 'text-cyan-400 animate-listening' : ''}`}
            aria-label="Search by voice"
            >
            <MicrophoneIcon className="w-6 h-6" />
            </button>
        )}
    </div>
    <button
      type="submit"
      disabled={isLoading || isListening}
      className="px-6 sm:px-8 py-3 text-base sm:text-lg font-bold text-white bg-cyan-600 rounded-full hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
    >
      {isLoading ? 'Searching...' : 'Define'}
    </button>
  </form>
);

interface ResultDisplayProps {
  term: string;
  definition: SlangDefinition;
  onSpeak: () => void;
  isSpeaking: boolean;
  isAudioReady: boolean;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ term, definition, onSpeak, isSpeaking, isAudioReady }) => {
    return (
      <div className="w-full max-w-2xl mt-8 p-4 sm:p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-xl animate-fade-in">
        <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400 break-words capitalize flex-grow">{term}</h2>
            <button 
                onClick={onSpeak} 
                disabled={!isAudioReady}
                className="p-2 rounded-full text-gray-400 enabled:hover:text-cyan-400 enabled:hover:bg-gray-700/50 disabled:text-gray-600 disabled:cursor-wait transition-colors flex-shrink-0 ml-4"
                aria-label={isSpeaking ? "Stop reading" : "Read definition aloud"}
            >
                {isSpeaking ? <StopIcon /> : <SpeakerIcon />}
            </button>
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-300 mb-2">Meaning</h3>
          <p className="text-base sm:text-lg text-gray-200 leading-relaxed">{definition.meaning}</p>
        </div>
        <div className="mt-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-300 mb-2">Example</h3>
          <p className="text-base sm:text-lg text-gray-200 leading-relaxed italic border-l-4 border-cyan-500 pl-4">"{definition.example}"</p>
        </div>
      </div>
    );
};

const LoadingSpinner: React.FC = () => (
    <div className="w-full max-w-2xl mt-8 flex justify-center items-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500"></div>
    </div>
);

interface InitialStateDisplayProps {
    examples: string[];
    onExampleClick: (example: string) => void;
    onRefresh: () => void;
    onToggleShowMore: () => void;
    showAll: boolean;
}

const InitialStateDisplay: React.FC<InitialStateDisplayProps> = ({ examples, onExampleClick, onRefresh, onToggleShowMore, showAll }) => {
    return (
        <div className="text-center mt-8 text-gray-400 max-w-2xl animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-2">Unlock Modern Language</h2>
            <p className="text-lg">Enter a slang word, abbreviation, or internet term to get its definition and see it in action.</p>
            <div className="mt-6">
                <div className="flex justify-center items-center gap-4 mb-3">
                    <p className="text-sm text-gray-500">Or try one of these popular terms:</p>
                    <button onClick={onRefresh} className="text-gray-500 hover:text-cyan-400 transition-colors" aria-label="Refresh examples">
                        <RefreshIcon />
                    </button>
                    <button onClick={onToggleShowMore} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium" aria-label={showAll ? "Show fewer examples" : "Show more examples"}>
                        {showAll ? 'Show Less' : 'Show More'}
                    </button>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {examples.map(ex => (
                    <button 
                      key={ex}
                      onClick={() => onExampleClick(ex)}
                      className="px-3 py-1 text-sm text-cyan-300 bg-gray-800 border border-gray-700 rounded-full hover:bg-gray-700 hover:text-cyan-200 transition-colors"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
            </div>
        </div>
    );
};


const ALL_EXAMPLES = [
    'rizz', 'iykyk', 'based', 'GOAT', 'no cap', 'bet', 'slay', 'ghosting', 
    'salty', 'drip', 'finna', 'simp', 'TFW', 'boujee', 'stan', 'mid', 'L', 
    'W', 'pog', 'copium', 'delulu', 'sheesh', 'yeet', 'vibe check'
];
const EXAMPLES_TO_SHOW = 15;

const shuffleArray = (array: string[]) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}


export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [definition, setDefinition] = useState<SlangDefinition | null>(null);
  const [submittedTerm, setSubmittedTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialState, setIsInitialState] = useState(true);
  
  // --- Audio State ---
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [prefetchedAudioChunks, setPrefetchedAudioChunks] = useState<(AudioBuffer | null)[]>([]);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const currentlyPlayingSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // --- Mic State ---
  const [isListening, setIsListening] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // --- Examples State ---
  const [shuffledExamples, setShuffledExamples] = useState<string[]>([]);
  const [showAllExamples, setShowAllExamples] = useState(false);

  const refreshExamples = useCallback(() => {
    setShuffledExamples(shuffleArray([...ALL_EXAMPLES]));
  }, []);

  const handleToggleShowMore = () => {
    setShowAllExamples(prev => !prev);
  };

  useEffect(() => {
    refreshExamples();
  }, [refreshExamples]);

  useEffect(() => {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    setAudioContext(context);
    return () => {
      context.close();
    };
  }, []);

  const prefetchAudio = useCallback(async (term: string, definition: SlangDefinition) => {
    if (!audioContext) return;
    
    const textToSpeak = `${term}. Meaning: ${definition.meaning}. Example: ${definition.example}`;
    const textChunks = textToSpeak.match(/[^.!?]+[.!?]+/g) || [textToSpeak];

    setPrefetchedAudioChunks(new Array(textChunks.length).fill(null));

    textChunks.forEach(async (chunk, index) => {
        try {
            const base64Audio = await getSpeech(chunk.trim());
            if (base64Audio && audioContext) {
                const audioBuffer = await decodeAudioData(
                    decode(base64Audio),
                    audioContext,
                    24000,
                    1,
                );
                setPrefetchedAudioChunks(prev => {
                    const newChunks = [...prev];
                    newChunks[index] = audioBuffer;
                    if (index === 0) {
                        setIsAudioReady(true);
                    }
                    return newChunks;
                });
            }
        } catch (err) {
            console.error(`Audio prefetch for chunk ${index} failed:`, err);
        }
    });
  }, [audioContext]);

  const performSearch = useCallback(async (termToSearch: string) => {
    if (!termToSearch.trim()) {
      setError("Please enter a term to search.");
      return;
    }

    const trimmedTerm = termToSearch.trim();
    setIsLoading(true);
    setError(null);
    setDefinition(null);
    setIsAudioReady(false);
    setPrefetchedAudioChunks([]);
    setIsInitialState(false);
    setSubmittedTerm(trimmedTerm);

    try {
      const result = await getSlangDefinition(trimmedTerm);
      setDefinition(result);
      prefetchAudio(trimmedTerm, result);
    } catch (err: any) {
      if (err.message?.startsWith('Term not found:')) {
        setError(`Sorry, we couldn't find a definition for "${trimmedTerm}". Try another?`);
      } else {
        setError(err.message || 'An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [prefetchAudio]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicSupported(false);
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.interimResults = false;
    }
    
    const recognition = recognitionRef.current;

    const handleResult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
      performSearch(transcript);
    };

    const handleError = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'not-allowed') {
        setError('Microphone access was denied. Please allow it in your browser settings to use voice search.');
      } else {
        setError(`Speech recognition error: ${event.error}. Please try again.`);
      }
      setIsListening(false);
    };

    const handleEnd = () => {
      setIsListening(false);
    };
    
    recognition.addEventListener('result', handleResult);
    recognition.addEventListener('error', handleError);
    recognition.addEventListener('end', handleEnd);

    return () => {
      recognition.removeEventListener('result', handleResult);
      recognition.removeEventListener('error', handleError);
      recognition.removeEventListener('end', handleEnd);
    };
  }, [performSearch]);


  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    performSearch(searchTerm);
  }, [searchTerm, performSearch]);

  const handleExampleClick = useCallback((exampleTerm: string) => {
    setSearchTerm(exampleTerm);
    performSearch(exampleTerm);
  }, [performSearch]);
  
  const playAudioQueue = useCallback(() => {
    if (!audioContext) return;

    const playNext = (index: number) => {
        if (index >= prefetchedAudioChunks.length) {
            setIsSpeaking(false);
            currentlyPlayingSourceRef.current = null;
            return;
        }

        const buffer = prefetchedAudioChunks[index];
        if (buffer) {
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start();
            currentlyPlayingSourceRef.current = source;
            source.onended = () => playNext(index + 1);
        } else {
            setTimeout(() => playNext(index), 200);
        }
    }
    playNext(0);
}, [audioContext, prefetchedAudioChunks]);

  const handleSpeak = useCallback(() => {
      if (!audioContext || !isAudioReady) return;

      if (isSpeaking) {
          if (currentlyPlayingSourceRef.current) {
              currentlyPlayingSourceRef.current.onended = null;
              currentlyPlayingSourceRef.current.stop();
              currentlyPlayingSourceRef.current = null;
          }
          setIsSpeaking(false);
      } else {
          if (audioContext.state === 'suspended') {
              audioContext.resume();
          }
          setIsSpeaking(true);
          playAudioQueue();
      }
  }, [audioContext, isSpeaking, isAudioReady, playAudioQueue]);

  const handleMicClick = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      setSearchTerm('');
      setError(null);
      setDefinition(null);
      setIsInitialState(false);
      setIsListening(true);
      try {
        recognition.start();
      } catch (e) {
        setError("Could not start voice recognition. Please ensure microphone is connected.");
        setIsListening(false);
      }
    }
  }, [isListening]);

  const examplesToDisplay = showAllExamples ? shuffledExamples : shuffledExamples.slice(0, EXAMPLES_TO_SHOW);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6">
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        @keyframes listening-pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.7);
          }
          70% {
            transform: scale(1.1);
            box-shadow: 0 0 0 12px rgba(56, 189, 248, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(56, 189, 248, 0);
          }
        }
        .animate-listening {
          animation: listening-pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
        }
      `}</style>
      <header className="w-full max-w-2xl mb-8 text-center">
        <div className="flex justify-center items-center gap-4 mb-2">
            <Logo />
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            SlangSupport
            </h1>
        </div>
        <p className="text-lg text-gray-400">Your modern-day urban dictionary.</p>
      </header>
      
      <main className="w-full flex-grow flex flex-col items-center">
        <InputForm 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          handleSubmit={handleSubmit} 
          isLoading={isLoading} 
          isListening={isListening}
          onMicClick={handleMicClick}
          micSupported={micSupported}
        />
        
        {isInitialState && (
            <InitialStateDisplay 
                examples={examplesToDisplay} 
                onExampleClick={handleExampleClick} 
                onRefresh={refreshExamples}
                onToggleShowMore={handleToggleShowMore}
                showAll={showAllExamples}
            />
        )}
        
        {isLoading && <LoadingSpinner />}
        
        {error && (
          <div className="mt-8 p-4 w-full max-w-2xl bg-red-900/50 border border-red-700 text-red-300 rounded-xl animate-fade-in">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        {definition && !isLoading && (
          <ResultDisplay 
            term={submittedTerm} 
            definition={definition}
            onSpeak={handleSpeak}
            isSpeaking={isSpeaking} 
            isAudioReady={isAudioReady}
          />
        )}
      </main>
      
      <footer className="w-full text-center p-4 mt-8">
        <p className="text-gray-500 text-sm">Powered by Gemini</p>
      </footer>
    </div>
  );
}