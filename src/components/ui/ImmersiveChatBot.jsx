import { useState, useEffect, useRef, useCallback } from 'react';

const REPLIT_BASE = 'https://mujeeb-lawal.replit.app';
const MAX_MESSAGES = 15;
const genSessionId = () => `imm-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const S = {
  btn: {
    position: 'fixed',
    right: '20px',
    bottom: '20px',
    zIndex: 9998,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 15px',
    background: 'rgba(255,255,255,0.92)',
    border: '2px solid #1a1a1a',
    borderRadius: '7px',
    color: '#1a1a1a',
    cursor: 'pointer',
    fontFamily: '"Caveat", cursive',
    fontSize: '20px',
    fontWeight: 700,
    lineHeight: 1,
    boxShadow: '2px 2px 0 rgba(0,0,0,0.18)',
    backdropFilter: 'blur(2px)',
    textDecoration: 'none',
  },
  panel: {
    position: 'fixed',
    right: '20px',
    bottom: '70px',
    width: '330px',
    maxHeight: '460px',
    zIndex: 9997,
    background: 'rgba(250,247,240,0.98)',
    border: '2px solid #1a1a1a',
    borderRadius: '10px',
    boxShadow: '4px 4px 0 rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: '"Inter", sans-serif',
  },
  header: {
    padding: '11px 14px',
    background: '#1a1a1a',
    color: '#f4f0e7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: '"Caveat", cursive',
    fontSize: '17px',
    fontWeight: 700,
    flexShrink: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#f4f0e7',
    cursor: 'pointer',
    fontSize: '22px',
    lineHeight: 1,
    padding: '0 2px',
    opacity: 0.8,
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '9px',
  },
  userMsg: {
    alignSelf: 'flex-end',
    background: '#1a1a1a',
    color: '#f4f0e7',
    padding: '7px 11px',
    borderRadius: '8px 8px 2px 8px',
    maxWidth: '84%',
    fontSize: '13px',
    lineHeight: 1.5,
    wordBreak: 'break-word',
  },
  aiMsg: {
    alignSelf: 'flex-start',
    background: '#fff',
    border: '1px solid #d4c9b8',
    color: '#1a1a1a',
    padding: '7px 11px',
    borderRadius: '8px 8px 8px 2px',
    maxWidth: '84%',
    fontSize: '13px',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  form: {
    display: 'flex',
    gap: '7px',
    padding: '9px',
    borderTop: '1px solid #d4c9b8',
    background: '#fdfaf5',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: '1.5px solid #c8bfb0',
    borderRadius: '6px',
    padding: '7px 9px',
    fontSize: '13px',
    outline: 'none',
    fontFamily: '"Inter", sans-serif',
    background: '#fff',
    resize: 'none',
  },
  sendBtn: {
    padding: '7px 13px',
    background: '#1a1a1a',
    color: '#f4f0e7',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    flexShrink: 0,
    alignSelf: 'flex-end',
  },
};

export default function ImmersiveChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm Mujeeb's AI assistant. Ask me anything about his career, programmes or experience." }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId] = useState(genSessionId);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const userMsgCount = messages.filter(m => m.role === 'user').length;
  const atLimit = userMsgCount >= MAX_MESSAGES;

  const scrollBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollBottom(); }, [messages, scrollBottom]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 120);
  }, [isOpen]);

  const saveTranscript = useCallback(async (msgs) => {
    if (msgs.filter(m => m.role === 'user').length === 0) return;
    try {
      await fetch(`${REPLIT_BASE}/api/chat/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, messages: msgs }),
      });
    } catch (_) { /* non-critical */ }
  }, [sessionId]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    saveTranscript(messages);
  }, [messages, saveTranscript]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming || atLimit) return;

    const withUser = [...messages, { role: 'user', text }];
    setMessages(withUser);
    setInput('');
    setIsStreaming(true);

    const streamIdx = withUser.length;
    setMessages(prev => [...prev, { role: 'assistant', text: '' }]);

    try {
      const res = await fetch(`${REPLIT_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') continue;
          try {
            const { content = '' } = JSON.parse(raw);
            if (content) {
              full += content;
              setMessages(prev => {
                const copy = [...prev];
                copy[streamIdx] = { role: 'assistant', text: full };
                return copy;
              });
            }
          } catch (_) { /* malformed chunk */ }
        }
      }
    } catch {
      setMessages(prev => {
        const copy = [...prev];
        copy[streamIdx] = { role: 'assistant', text: "Sorry, I'm having trouble connecting right now. Please try again shortly." };
        return copy;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, messages, atLimit]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      {isOpen && (
        <div style={S.panel} role="dialog" aria-label="AI Assistant" aria-modal="true">
          <div style={S.header}>
            <span>✦ Ask Me Anything</span>
            <button style={S.closeBtn} onClick={handleClose} aria-label="Close chat">×</button>
          </div>

          <div style={S.messages} role="log" aria-live="polite">
            {messages.map((msg, i) => (
              <div key={i} style={msg.role === 'user' ? S.userMsg : S.aiMsg}>
                {msg.text || (isStreaming && i === messages.length - 1 ? '▋' : '')}
              </div>
            ))}
            {atLimit && (
              <div style={{ textAlign: 'center', fontSize: '12px', color: '#888', padding: '8px 4px' }}>
                Session limit reached.{' '}
                <a href={REPLIT_BASE} target="_blank" rel="noopener noreferrer" style={{ color: '#1a1a1a', fontWeight: 600 }}>
                  Continue on the classic site →
                </a>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form style={S.form} onSubmit={e => { e.preventDefault(); sendMessage(); }}>
            <input
              ref={inputRef}
              style={S.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={atLimit ? 'Session limit reached' : 'Ask about Mujeeb…'}
              disabled={isStreaming || atLimit}
              maxLength={600}
              aria-label="Your message"
            />
            <button
              type="submit"
              style={{ ...S.sendBtn, opacity: (isStreaming || !input.trim() || atLimit) ? 0.45 : 1 }}
              disabled={isStreaming || !input.trim() || atLimit}
            >
              {isStreaming ? '…' : 'Send'}
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => isOpen ? handleClose() : setIsOpen(true)}
        style={S.btn}
        aria-label={isOpen ? 'Close AI assistant' : 'Ask me anything — AI assistant'}
        aria-expanded={isOpen}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        {isOpen ? 'Close' : 'Ask Me Anything'}
      </button>
    </>
  );
}
