import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, RotateCcw, Send, Bot, CheckCircle, ChevronRight } from 'lucide-react';

const CS_API_BASE = 'http://localhost:3001';

export function CustomerServiceWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Ambil atau generate session id
  const [sessionId] = useState(() => {
    let saved = localStorage.getItem('cs_session_id');
    if (!saved) {
      saved = 'sess_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('cs_session_id', saved);
    }
    return saved;
  });

  // Sambutan awal
  useEffect(() => {
    loadHistory();
  }, [sessionId]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    try {
      const res = await fetch(`${CS_API_BASE}/api/history/${sessionId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        setMessages(data.data);
      } else {
        setMessages([
          {
            role: 'assistant',
            content: 'Halo! 👋 Selamat datang di **Sistem Penanganan Kendala Client**.\n\nSaya **TeknoBot**, asisten CS & Helpdesk AI. Ada kendala IT yang bisa saya bantu cek (misal status tiket kendala, panduan penanganan error 500, akun login terkunci, atau eskalasi ke Service Desk)?',
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch {
      setMessages([
        {
          role: 'assistant',
          content: 'Halo! 👋 Selamat datang di **Sistem Penanganan Kendala Client**.\n\nSaya **TeknoBot**, asisten CS & Helpdesk AI. Ada kendala IT yang bisa saya bantu cek (misal status tiket kendala, panduan penanganan error 500, akun login terkunci, atau eskalasi ke Service Desk)?',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Hapus seluruh riwayat percakapan CS?')) return;
    try {
      await fetch(`${CS_API_BASE}/api/reset/${sessionId}`, { method: 'POST' });
      setMessages([
        {
          role: 'assistant',
          content: 'Riwayat percakapan telah dibersihkan. ✨\n\nAda hal lain yang bisa TeknoBot bantu?',
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (err) {
      alert('Gagal membersihkan riwayat percakapan.');
    }
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || isSending) return;

    setInput('');
    setIsSending(true);

    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch(`${CS_API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: text,
          stream: true
        })
      });

      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }

      // Placeholder bot message yang akan di-update streaming
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '', timestamp: new Date().toISOString() }
      ]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let streamedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const dataStr = trimmed.slice(6);
          if (dataStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.chunk) {
              streamedContent += parsed.chunk;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: streamedContent
                };
                return updated;
              });
            } else if (parsed.error) {
              streamedContent += `\n[Error: ${parsed.error}]`;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: streamedContent
                };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Maaf, terjadi kendala koneksi ke csService (Port 3001): ${err.message}. Mohon pastikan service Node.js sudah aktif.`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const renderContent = (content) => {
    return content.split('\n').map((line, idx) => {
      // Bold rendering
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={idx} className="block leading-relaxed">
          {parts.map((p, i) => {
            if (p.startsWith('**') && p.endsWith('**')) {
              return <strong key={i} className="font-semibold text-slate-900">{p.slice(2, -2)}</strong>;
            }
            return p;
          })}
        </span>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
          title="Buka Customer Service AI"
          aria-label="Customer Service AI"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Floating Chat Box */}
      {isOpen && (
        <div className="w-[380px] max-w-[calc(100vw-32px)] h-[580px] max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-5 py-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-lg">
                🤖
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-tight leading-tight">TeknoBot CS</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-blue-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Online 24/7 (AI Assistant)
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                className="p-1.5 hover:bg-white/15 rounded-lg text-white/80 hover:text-white transition"
                title="Reset Percakapan"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/15 rounded-lg text-white/80 hover:text-white transition"
                title="Tutup Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl shadow-xs text-slate-800 ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white border border-slate-200 rounded-bl-xs'
                  }`}
                >
                  {renderContent(m.content)}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {new Date(m.timestamp || Date.now()).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            ))}

            {/* Quick Suggestions di pesan pertama */}
            {messages.length === 1 && !isSending && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  onClick={() => handleSend('Cek status tiket TCK-202610-0001')}
                  className="bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 text-[11px] px-2.5 py-1.5 rounded-full transition flex items-center gap-1 text-left"
                >
                  🎫 Cek Tiket TCK-202610-0001
                </button>
                <button
                  onClick={() => handleSend('Apa solusi awal jika muncul Error 500 pada portal klien?')}
                  className="bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 text-[11px] px-2.5 py-1.5 rounded-full transition flex items-center gap-1 text-left"
                >
                  🚨 Panduan Error 500
                </button>
                <button
                  onClick={() => handleSend('Bagaimana alur status tiket dari Pending hingga Resolved?')}
                  className="bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 text-[11px] px-2.5 py-1.5 rounded-full transition flex items-center gap-1 text-left"
                >
                  ⏱️ Alur Status & SLA
                </button>
                <button
                  onClick={() => handleSend('Bagaimana jika akun klien terkunci karena salah password?')}
                  className="bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 text-[11px] px-2.5 py-1.5 rounded-full transition flex items-center gap-1 text-left"
                >
                  🔑 Akun Login Terkunci
                </button>
              </div>
            )}

            {isSending && (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-200/70 rounded-xl w-fit text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya kendala, produk, resi..."
              className="flex-1 text-xs bg-slate-100 focus:bg-white border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-3.5 py-2 outline-none transition"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white flex items-center justify-center transition focus:outline-none"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
export default CustomerServiceWidget;
