(function () {
  let sessionId = localStorage.getItem('cs_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('cs_session_id', sessionId);
  }

  const API_BASE = window.CS_API_BASE || 'http://localhost:3001';

  const widgetHTML = `
    <button id="cs-widget-toggle" aria-label="Buka Chat Customer Service">
      <svg viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/>
        <circle cx="8" cy="10" r="1.5"/>
        <circle cx="12" cy="10" r="1.5"/>
        <circle cx="16" cy="10" r="1.5"/>
      </svg>
    </button>

    <div id="cs-widget-container">
      <div class="cs-header">
        <div class="cs-header-info">
          <div class="cs-avatar">🤖</div>
          <div class="cs-title-group">
            <h4>TeknoBot CS</h4>
            <span><span class="cs-online-dot"></span> Online 24/7 (AI Assistant)</span>
          </div>
        </div>
        <div class="cs-header-actions">
          <button id="cs-reset-btn" title="Hapus Riwayat Chat">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          </button>
          <button id="cs-close-btn" title="Tutup Chat">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="cs-messages" id="cs-messages">
        <div class="cs-msg assistant">
          <div class="cs-bubble">
            <p>Halo! 👋 Selamat datang di <strong>Sistem Penanganan Kendala Client</strong>.</p>
            <p>Saya <strong>TeknoBot</strong>, asisten CS & Helpdesk AI. Ada kendala IT yang bisa saya bantu cek (misal status tiket, panduan error 500, akun login terkunci, atau eskalasi ke Service Desk)?</p>
            
            <div class="cs-quick-chips">
              <div class="cs-chip" data-msg="Cek status tiket TCK-202610-0001">🎫 Cek Tiket TCK-202610-0001</div>
              <div class="cs-chip" data-msg="Apa solusi awal jika muncul Error 500 pada portal klien?">🚨 Panduan Error 500</div>
              <div class="cs-chip" data-msg="Bagaimana alur status tiket dari Pending hingga Resolved?">⏱️ Alur Status & SLA</div>
              <div class="cs-chip" data-msg="Bagaimana jika akun klien terkunci karena salah password?">🔑 Akun Login Terkunci</div>
            </div>
          </div>
          <span class="cs-msg-time">${formatTime(new Date())}</span>
        </div>
      </div>

      <div class="cs-footer">
        <div class="cs-input-box">
          <input type="text" id="cs-input" placeholder="Ketik pertanyaan atau nomor order..." autocomplete="off" />
        </div>
        <button id="cs-send" class="cs-send-btn" aria-label="Kirim Pesan">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  `;

  function initWidget() {
    if (document.getElementById('cs-widget-container')) return;

    const div = document.createElement('div');
    div.innerHTML = widgetHTML;
    document.body.appendChild(div);

    bindEvents();
    loadChatHistory();
  }

  function formatTime(d) {
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }

  function renderMarkdown(text) {
    if (!text) return '';
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/^\s*-\s+(.*)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    html = html.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br/>');
    return `<p>${html}</p>`;
  }

  let isSending = false;

  function bindEvents() {
    const toggleBtn = document.getElementById('cs-widget-toggle');
    const container = document.getElementById('cs-widget-container');
    const closeBtn = document.getElementById('cs-close-btn');
    const resetBtn = document.getElementById('cs-reset-btn');
    const input = document.getElementById('cs-input');
    const sendBtn = document.getElementById('cs-send');
    const messages = document.getElementById('cs-messages');

    toggleBtn.addEventListener('click', () => {
      container.classList.toggle('open');
      if (container.classList.contains('open')) {
        input.focus();
        scrollToBottom();
      }
    });

    closeBtn.addEventListener('click', () => {
      container.classList.remove('open');
    });

    resetBtn.addEventListener('click', async () => {
      if (!confirm('Hapus seluruh riwayat percakapan?')) return;
      try {
        await fetch(`${API_BASE}/api/reset/${sessionId}`, { method: 'POST' });
        localStorage.removeItem('cs_session_id');
        sessionId = 'sess_' + Math.random().toString(36).substring(2, 10);
        localStorage.setItem('cs_session_id', sessionId);
        
        messages.innerHTML = `
          <div class="cs-msg assistant">
            <div class="cs-bubble">
              <p>Riwayat percakapan telah dibersihkan. ✨</p>
              <p>Ada hal lain yang bisa TeknoBot bantu?</p>
            </div>
            <span class="cs-msg-time">${formatTime(new Date())}</span>
          </div>
        `;
      } catch (err) {
        alert('Gagal me-reset sesi chat.');
      }
    });

    sendBtn.addEventListener('click', handleSend);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    messages.addEventListener('click', (e) => {
      const chip = e.target.closest('.cs-chip');
      if (chip && !isSending) {
        const text = chip.getAttribute('data-msg');
        if (text) {
          input.value = text;
          handleSend();
        }
      }
    });
  }

  function appendMessage(role, content, time = new Date()) {
    const messages = document.getElementById('cs-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `cs-msg ${role}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'cs-bubble';
    bubble.innerHTML = role === 'user' ? escapeHtml(content) : renderMarkdown(content);
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'cs-msg-time';
    timeSpan.textContent = formatTime(new Date(time));

    msgDiv.appendChild(bubble);
    msgDiv.appendChild(timeSpan);
    messages.appendChild(msgDiv);
    scrollToBottom();
    return bubble;
  }

  function escapeHtml(str) {
    const p = document.createElement('p');
    p.appendChild(document.createTextNode(str));
    return p.innerHTML;
  }

  function showTypingIndicator() {
    const messages = document.getElementById('cs-messages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'cs-typing-indicator';
    typingDiv.className = 'cs-msg assistant';
    typingDiv.innerHTML = `
      <div class="cs-typing">
        <span class="cs-typing-dot"></span>
        <span class="cs-typing-dot"></span>
        <span class="cs-typing-dot"></span>
      </div>
    `;
    messages.appendChild(typingDiv);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const el = document.getElementById('cs-typing-indicator');
    if (el) el.remove();
  }

  function scrollToBottom() {
    const messages = document.getElementById('cs-messages');
    messages.scrollTop = messages.scrollHeight;
  }

  async function handleSend() {
    const input = document.getElementById('cs-input');
    const text = input.value.trim();
    if (!text || isSending) return;

    isSending = true;
    input.value = '';
    document.getElementById('cs-send').disabled = true;

    appendMessage('user', text);
    showTypingIndicator();

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId,
          message: text,
          stream: true,
        }),
      });

      removeTypingIndicator();

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const botBubble = appendMessage('assistant', '');
      let fullContent = '';

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

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
              fullContent += parsed.chunk;
              botBubble.innerHTML = renderMarkdown(fullContent);
              scrollToBottom();
            } else if (parsed.error) {
              fullContent += `\n[Terjadi kesalahan: ${parsed.error}]`;
              botBubble.innerHTML = renderMarkdown(fullContent);
            }
          } catch (e) {}
        }
      }

    } catch (err) {
      removeTypingIndicator();
      appendMessage('assistant', `Maaf, terjadi kendala koneksi ke server CS: ${err.message}. Mohon pastikan csService sudah aktif di port 3001.`);
    } finally {
      isSending = false;
      document.getElementById('cs-send').disabled = false;
      document.getElementById('cs-input').focus();
    }
  }

  async function loadChatHistory() {
    try {
      const res = await fetch(`${API_BASE}/api/history/${sessionId}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        for (const m of json.data) {
          appendMessage(m.role, m.content, m.timestamp);
        }
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();
