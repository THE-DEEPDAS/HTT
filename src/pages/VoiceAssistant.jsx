import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Phone, PhoneOff, Bot, Volume2, Radio, ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const VoiceAssistant = () => {
  const [sessionId, setSessionId] = useState(null);
  const [currentStep, setCurrentStep] = useState('greeting');
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [validAnswers, setValidAnswers] = useState([]);

  const recognitionRef = useRef(null);
  const speechTimeoutRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const transcriptContainerRef = useRef(null);
  const sessionIdRef = useRef(null);
  const currentStepRef = useRef('greeting');

  const apiUrl = import.meta.env.VITE_VOICE_API || `${window.location.origin}/api/voice`;

  // ── Browser TTS helper ──────────────────────────────────────────
  const browserSpeak = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) { resolve(); return; }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => {
        setIsSpeaking(false);
        // Auto-listen after bot finishes speaking
        if (currentStepRef.current !== 'completed') {
          setTimeout(startListening, 500);
        }
        resolve();
      };
      utterance.onerror = () => { setIsSpeaking(false); resolve(); };
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    });
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    // Scroll only within the transcript panel, not the whole page
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [messages, liveTranscript]);

  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showError('Speech recognition not supported. Please use Chrome or Edge.');
      return false;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      finalTranscriptRef.current = '';
      setLiveTranscript('');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript + ' ';
          if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
          speechTimeoutRef.current = setTimeout(() => {
            const completeSpeech = finalTranscriptRef.current.trim();
            if (completeSpeech) {
              recognition.stop();
              addMessage('user', completeSpeech);
              processUserInput(completeSpeech);
              finalTranscriptRef.current = '';
              setLiveTranscript('');
            }
          }, 1500);
        } else {
          interimTranscript += transcript;
        }
      }
      setLiveTranscript((finalTranscriptRef.current + interimTranscript).trim());
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') showError(`Recognition error: ${event.error}`);
      setIsListening(false);
      setLiveTranscript('');
    };

    recognition.onend = () => {
      setIsListening(false);
      setLiveTranscript('');
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      const completeSpeech = finalTranscriptRef.current.trim();
      if (completeSpeech && !isSpeaking) {
        addMessage('user', completeSpeech);
        processUserInput(completeSpeech);
        finalTranscriptRef.current = '';
      }
    };

    recognitionRef.current = recognition;
    return true;
  };

  const startConversation = async () => {
    try {
      const response = await fetch(`${apiUrl}/start/`, { method: 'POST' });
      const data = await response.json();
      setSessionId(data.session_id);
      sessionIdRef.current = data.session_id;
      setCurrentStep(data.next_step);
      currentStepRef.current = data.next_step;
      setIsActive(true);
      setMessages([]);
      if (data.valid_answers) setValidAnswers(data.valid_answers);
      addMessage('bot', data.message);
      await speakText(data.message);
      if (!initSpeechRecognition()) showError('Failed to initialize speech recognition');
    } catch (err) {
      showError('Failed to start: ' + err.message);
    }
  };

  const processUserInput = async (text) => {
    try {
      const response = await fetch(`${apiUrl}/process/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionIdRef.current, text, current_step: currentStepRef.current }),
      });
      const data = await response.json();
      if (!data.text) throw new Error('No response text received');
      setCurrentStep(data.next_step);
      currentStepRef.current = data.next_step;
      if (data.valid_answers) setValidAnswers(data.valid_answers);
      addMessage('bot', data.text);
      await browserSpeak(data.text);
      if (data.next_step === 'completed') setTimeout(endConversation, 2000);
    } catch (err) {
      showError('Processing failed: ' + err.message);
    }
  };

  const speakText = async (text) => {
    try {
      await browserSpeak(text);
    } catch (err) {
      console.error('TTS error:', err);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isSpeaking) {
      try { recognitionRef.current.start(); } catch (err) { showError('Mic access denied.'); }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) recognitionRef.current.stop();
  };

  const endConversation = () => {
    setIsActive(false);
    if (recognitionRef.current && isListening) recognitionRef.current.stop();
    setIsListening(false);
    setLiveTranscript('');
    setValidAnswers([]);
    addMessage('system', 'Session ended. Start a new session anytime.');
  };

  const addMessage = (type, text) => setMessages(prev => [...prev, { type, text, time: new Date() }]);
  const showError = (message) => { setError(message); setTimeout(() => setError(null), 4000); };

  const handleSuggestedAnswer = (answer) => {
    if (!isActive || isSpeaking) return;
    stopListening();
    addMessage('user', answer);
    processUserInput(answer);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Separate messages into bot and user for the transcript panel
  const botMessages = messages.filter(m => m.type === 'bot');
  const userMessages = messages.filter(m => m.type === 'user');

  return (
    <div className="min-h-[calc(100vh-73px)] bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      {/* Top bar */}
      <div className="border-b border-gray-200/60 bg-white/80 backdrop-blur-lg sticky top-[73px] z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div className="h-5 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}>
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-900">Voice Assistant</h1>
                <p className="text-xs text-gray-500">
                  {isActive
                    ? isListening ? '🎙️ Listening...' : isSpeaking ? '🔊 Speaking...' : '✅ Active'
                    : '💤 Idle — Start a session'}
                </p>
              </div>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-3">
            {isActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: '#dcfce7', color: '#166534' }}
              >
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Session Active
              </motion.div>
            )}
            {currentStep !== 'greeting' && isActive && (
              <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2.5 py-1 rounded-md">
                Step: {currentStep}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-3"
          >
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <span className="font-medium">Error:</span> {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3-Column Layout */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-200px)]">

          {/* =================== LEFT COLUMN — Transcription =================== */}
          <div className="lg:col-span-3 flex flex-col bg-white rounded-2xl border border-gray-200/60 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            {/* Panel header */}
            <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#eff6ff' }}>
                  <Volume2 className="w-4 h-4" style={{ color: '#2563eb' }} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Conversation Log</h2>
                  <p className="text-[11px] text-gray-400">{messages.length} messages</p>
                </div>
              </div>
            </div>

            {/* Transcript messages */}
            <div ref={transcriptContainerRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-10">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#f1f5f9' }}>
                    <Volume2 className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-400">No conversation yet</p>
                  <p className="text-xs text-gray-300 mt-1">Start a session to begin</p>
                </div>
              )}

              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className="group"
                >
                  {msg.type === 'system' ? (
                    <div className="text-center py-2">
                      <span className="text-[11px] text-amber-600 bg-amber-50 px-3 py-1 rounded-full font-medium">
                        {msg.text}
                      </span>
                    </div>
                  ) : (
                    <div className={`flex gap-2.5 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div
                        className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                        style={{
                          backgroundColor: msg.type === 'bot' ? '#eff6ff' : '#f0fdf4',
                        }}
                      >
                        {msg.type === 'bot' ? (
                          <Bot className="w-3.5 h-3.5" style={{ color: '#2563eb' }} />
                        ) : (
                          <Mic className="w-3.5 h-3.5" style={{ color: '#16a34a' }} />
                        )}
                      </div>
                      <div className={`flex-1 ${msg.type === 'user' ? 'text-right' : ''}`}>
                        <div className="flex items-center gap-2 mb-0.5" style={{ justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start' }}>
                          <span className="text-[11px] font-semibold" style={{ color: msg.type === 'bot' ? '#2563eb' : '#16a34a' }}>
                            {msg.type === 'bot' ? 'AI Assistant' : 'You'}
                          </span>
                          <span className="text-[10px] text-gray-300">{formatTime(msg.time)}</span>
                        </div>
                        <p className="text-[13px] text-gray-700 leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Live transcript indicator */}
              {liveTranscript && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2.5 flex-row-reverse"
                >
                  <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5" style={{ backgroundColor: '#f0fdf4' }}>
                    <Mic className="w-3.5 h-3.5 text-green-500 animate-pulse" />
                  </div>
                  <div className="flex-1 text-right">
                    <span className="text-[11px] font-semibold text-green-600">You (speaking...)</span>
                    <p className="text-[13px] text-gray-500 italic leading-relaxed">{liveTranscript}...</p>
                  </div>
                </motion.div>
              )}

            </div>
          </div>

          {/* =================== MIDDLE COLUMN — Main UI =================== */}
          <div className="lg:col-span-6 flex flex-col bg-white rounded-2xl border border-gray-200/60 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            {/* Middle panel content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative overflow-y-auto">
              
              {/* Idle State */}
              {!isActive && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center max-w-md"
                >
                  <div className="relative mb-8">
                    <motion.div
                      className="w-28 h-28 rounded-3xl flex items-center justify-center mx-auto relative"
                      style={{ background: 'linear-gradient(135deg, #2563eb, #60a5fa)' }}
                      animate={{ scale: [1, 1.03, 1] }}
                      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    >
                      <Bot className="w-14 h-14 text-white" />
                      <motion.div
                        className="absolute inset-0 rounded-3xl"
                        style={{ border: '2px solid rgba(37, 99, 235, 0.3)' }}
                        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeOut' }}
                      />
                    </motion.div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">VoltStore Voice Assistant</h2>
                  <p className="text-gray-500 mb-8 leading-relaxed">
                    Start a voice session to process returns, exchanges, and get help with your orders. I'll guide you through each step.
                  </p>
                  <motion.button
                    onClick={startConversation}
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-semibold text-base transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      boxShadow: '0 8px 30px rgba(37, 99, 235, 0.35)',
                    }}
                    whileHover={{ scale: 1.03, boxShadow: '0 12px 40px rgba(37, 99, 235, 0.45)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Phone className="w-5 h-5" />
                    Start Voice Session
                  </motion.button>
                  <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 rounded-xl" style={{ backgroundColor: '#f8fafc' }}>
                      <p className="text-xs font-semibold text-gray-700">Returns</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Process refunds</p>
                    </div>
                    <div className="p-3 rounded-xl" style={{ backgroundColor: '#f8fafc' }}>
                      <p className="text-xs font-semibold text-gray-700">Exchanges</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Swap products</p>
                    </div>
                    <div className="p-3 rounded-xl" style={{ backgroundColor: '#f8fafc' }}>
                      <p className="text-xs font-semibold text-gray-700">Support</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Get help fast</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Active State */}
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center flex-1 w-full max-w-lg"
                >
                  {/* Voice visualization */}
                  <div className="relative mb-10">
                    {/* Outer ripples */}
                    {(isListening || isSpeaking) && (
                      <>
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          style={{
                            border: `2px solid ${isListening ? 'rgba(34, 197, 94, 0.2)' : 'rgba(37, 99, 235, 0.2)'}`,
                          }}
                          animate={{ scale: [1, 1.6, 1.6], opacity: [0.6, 0, 0] }}
                          transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          style={{
                            border: `2px solid ${isListening ? 'rgba(34, 197, 94, 0.15)' : 'rgba(37, 99, 235, 0.15)'}`,
                          }}
                          animate={{ scale: [1, 1.8, 1.8], opacity: [0.4, 0, 0] }}
                          transition={{ repeat: Infinity, duration: 2, ease: 'easeOut', delay: 0.5 }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          style={{
                            border: `2px solid ${isListening ? 'rgba(34, 197, 94, 0.1)' : 'rgba(37, 99, 235, 0.1)'}`,
                          }}
                          animate={{ scale: [1, 2, 2], opacity: [0.3, 0, 0] }}
                          transition={{ repeat: Infinity, duration: 2, ease: 'easeOut', delay: 1 }}
                        />
                      </>
                    )}

                    <motion.div
                      className="w-32 h-32 rounded-full flex items-center justify-center relative z-10"
                      style={{
                        background: isListening
                          ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                          : isSpeaking
                          ? 'linear-gradient(135deg, #2563eb, #3b82f6)'
                          : 'linear-gradient(135deg, #64748b, #94a3b8)',
                        boxShadow: isListening
                          ? '0 8px 40px rgba(34, 197, 94, 0.35)'
                          : isSpeaking
                          ? '0 8px 40px rgba(37, 99, 235, 0.35)'
                          : '0 4px 20px rgba(100, 116, 139, 0.2)',
                      }}
                      animate={isSpeaking ? { scale: [1, 1.06, 1] } : isListening ? { scale: [1, 1.04, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    >
                      {isListening ? (
                        <Mic className="w-12 h-12 text-white" />
                      ) : isSpeaking ? (
                        <Volume2 className="w-12 h-12 text-white" />
                      ) : (
                        <Bot className="w-12 h-12 text-white" />
                      )}
                    </motion.div>
                  </div>

                  {/* Status text */}
                  <motion.div
                    key={isListening ? 'listening' : isSpeaking ? 'speaking' : 'idle'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-2"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">
                      {isListening ? 'Listening to you...' : isSpeaking ? 'AI is speaking...' : 'Ready for input'}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {isListening
                        ? 'Speak naturally, I\'ll process when you pause'
                        : isSpeaking
                        ? 'Please wait while I respond'
                        : 'Press Speak or click a suggested answer'}
                    </p>
                  </motion.div>

                  {/* Live transcript preview */}
                  <AnimatePresence>
                    {liveTranscript && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 px-5 py-3 rounded-xl max-w-md text-center"
                        style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}
                      >
                        <p className="text-sm text-green-700 italic">"{liveTranscript}..."</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Audio wave bars */}
                  {(isListening || isSpeaking) && (
                    <div className="flex items-end gap-1 mt-6 h-8">
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 rounded-full"
                          style={{
                            backgroundColor: isListening ? '#22c55e' : '#3b82f6',
                          }}
                          animate={{
                            height: [
                              `${8 + Math.random() * 6}px`,
                              `${14 + Math.random() * 18}px`,
                              `${8 + Math.random() * 6}px`,
                            ],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.6 + Math.random() * 0.4,
                            delay: i * 0.05,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* ===== Bottom Controls ===== */}
            <div className="border-t border-gray-100 px-6 py-4 flex-shrink-0" style={{ backgroundColor: '#fafbfc' }}>
              <div className="flex items-center justify-center gap-3 max-w-lg mx-auto">
                {!isActive ? (
                  <motion.button
                    onClick={startConversation}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Phone className="w-4 h-4" />
                    Start Session
                  </motion.button>
                ) : (
                  <>
                    {/* Speak / Stop button */}
                    <motion.button
                      onClick={isListening ? stopListening : startListening}
                      disabled={isSpeaking}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50"
                      style={{
                        backgroundColor: isListening ? '#ef4444' : '#22c55e',
                        color: '#ffffff',
                        boxShadow: isListening ? '0 4px 15px rgba(239, 68, 68, 0.3)' : '0 4px 15px rgba(34, 197, 94, 0.3)',
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      {isListening ? 'Stop' : 'Speak'}
                    </motion.button>

                    {/* End Session button */}
                    <motion.button
                      onClick={endConversation}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
                      style={{
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                      }}
                      whileHover={{ scale: 1.02, backgroundColor: '#fecaca' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <PhoneOff className="w-4 h-4" />
                      End
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* =================== RIGHT COLUMN — Suggested Answers =================== */}
          <div className="lg:col-span-3 flex flex-col bg-white rounded-2xl border border-gray-200/60 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            {/* Panel header */}
            <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#faf5ff' }}>
                  <Sparkles className="w-4 h-4" style={{ color: '#7c3aed' }} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Suggested Answers</h2>
                  <p className="text-[11px] text-gray-400">Click to respond quickly</p>
                </div>
              </div>
            </div>

            {/* Answers content */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {!isActive ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#f1f5f9' }}>
                    <Sparkles className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-400">Suggestions appear here</p>
                  <p className="text-xs text-gray-300 mt-1">Start a session to see options</p>
                </div>
              ) : validAnswers.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#f1f5f9' }}>
                    <Radio className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-400">Waiting for suggestions...</p>
                  <p className="text-xs text-gray-300 mt-1">Options will appear based on the conversation</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-3">
                    {validAnswers.length} option{validAnswers.length > 1 ? 's' : ''} available
                  </p>
                  {validAnswers.map((answer, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => handleSuggestedAnswer(answer)}
                      disabled={isSpeaking}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 group border"
                      style={{
                        backgroundColor: '#fafbfc',
                        borderColor: '#e5e7eb',
                        color: '#374151',
                      }}
                      whileHover={{
                        backgroundColor: '#eff6ff',
                        borderColor: '#93c5fd',
                        scale: 1.01,
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}
                        >
                          {idx + 1}
                        </span>
                        <span className="leading-snug">{answer}</span>
                      </div>
                    </motion.button>
                  ))}

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      💡 <span className="font-medium">Tip:</span> Click any option above or speak your answer using the microphone.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Step info at bottom */}
            {isActive && (
              <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0" style={{ backgroundColor: '#fafbfc' }}>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400 font-medium">Current step</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                    {currentStep}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
