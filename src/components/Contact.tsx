import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, MessageSquare, ShieldCheck, Mail, Info } from 'lucide-react';

interface SentMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  timestamp: string;
}

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('FEEDBACK');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [outbox, setOutbox] = useState<SentMessage[]>([]);

  useEffect(() => {
    const local = localStorage.getItem('bookverse_outbox');
    if (local) {
      try {
        setOutbox(JSON.parse(local));
      } catch (err) {
        console.error('Error loading outbox:', err);
      }
    }
  }, []);

  const saveMessageToOutbox = (msg: SentMessage) => {
    const updated = [msg, ...outbox];
    setOutbox(updated);
    localStorage.setItem('bookverse_outbox', JSON.stringify(updated));
  };

  const clearOutboxHistory = () => {
    if (confirm('Clear all sent messages from outbox history?')) {
      setOutbox([]);
      localStorage.removeItem('bookverse_outbox');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setSending(true);

    setTimeout(() => {
      const newMessage: SentMessage = {
        id: `msg_${Math.random().toString(36).substring(2, 9)}`,
        name,
        email,
        subject: subject || 'No Subject Specified',
        category,
        message,
        timestamp: new Date().toISOString(),
      };

      saveMessageToOutbox(newMessage);
      setSending(false);
      setSuccess(true);
      
      // Reset form fields
      setName('');
      setEmail('');
      setSubject('');
      setCategory('FEEDBACK');
      setMessage('');

      // Auto-clear success banner after 4 seconds
      setTimeout(() => setSuccess(false), 4000);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in" id="contact-section">
      
      {/* Title */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Contact & Feedback
        </h1>
        <p className="text-base text-gray-500 max-w-xl mx-auto">
          Have a feature suggestion, general inquiry, or found a bug? Drop us a line below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Side: Contact Form */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="font-bold text-gray-900 dark:text-white text-base border-b border-gray-50 dark:border-slate-700 pb-3 flex items-center">
            <Mail className="h-5 w-5 text-emerald-600 mr-2" />
            Send a Message
          </h3>

          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-4 flex items-start space-x-3 text-emerald-800 dark:text-emerald-300 animate-pulse">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Message Transmitted!</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">Thank you for your valuable feedback. It has been cached in your local outbound outbox below.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="block w-full py-2.5 px-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-sm focus:ring-emerald-500/10 focus:border-emerald-500 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full py-2.5 px-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-sm focus:ring-emerald-500/10 focus:border-emerald-500 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Inquiry focus..."
                  className="block w-full py-2.5 px-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-sm focus:ring-emerald-500/10 focus:border-emerald-500 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block w-full py-2.5 px-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-sm focus:ring-emerald-500/10 focus:border-emerald-500 dark:text-white"
                >
                  <option value="FEEDBACK">General Feedback</option>
                  <option value="SUPPORT">Technical Support</option>
                  <option value="SUGGESTION">Book / Catalog Suggestion</option>
                  <option value="BUG">Bug Report / UI Error</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider">
                Message Content <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message details here..."
                className="block w-full p-3 text-sm border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:ring-emerald-500/10 focus:border-emerald-500 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full inline-flex items-center justify-center py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              id="submit-contact-form"
            >
              <Send className="h-4 w-4 mr-1.5" />
              {sending ? 'Transmitting...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Right Side: Info & History Outbox */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* General info box */}
          <div className="bg-gray-50 dark:bg-slate-900/50 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider flex items-center">
              <Info className="h-4 w-4 text-emerald-600 mr-2" />
              Transmission Protocol
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              In alignment with our privacy-first philosophy, this contact system does not transmit details to any secondary marketing trackers or trackers on startup. Form dispatches compile into structured local cache payloads.
            </p>
          </div>

          {/* Outbox Local History */}
          <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 shadow-xs flex flex-col justify-between h-[300px]">
            <div>
              <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-700 pb-2 mb-3">
                <h4 className="font-extrabold text-gray-900 dark:text-white text-xs flex items-center">
                  <MessageSquare className="h-4 w-4 text-emerald-600 mr-2" />
                  Local Outbox History ({outbox.length})
                </h4>
                {outbox.length > 0 && (
                  <button
                    onClick={clearOutboxHistory}
                    className="text-3xs font-mono text-red-500 hover:underline cursor-pointer"
                  >
                    Clear History
                  </button>
                )}
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[190px] pr-1">
                {outbox.length === 0 ? (
                  <div className="py-10 text-center text-xs text-gray-400 italic">
                    Outbox is empty. Send a message to seed outbox logs!
                  </div>
                ) : (
                  outbox.map((msg) => (
                    <div key={msg.id} className="p-3 bg-gray-50/50 dark:bg-slate-900/40 border border-gray-100/50 dark:border-slate-800 rounded-xl space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 text-3xs font-bold rounded-lg uppercase">
                          {msg.category}
                        </span>
                        <span className="text-3xs text-gray-400 font-mono">
                          {new Date(msg.timestamp).toLocaleDateString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-gray-800 dark:text-white truncate">{msg.subject}</h5>
                      <p className="text-2xs text-gray-500 dark:text-gray-400 line-clamp-2">{msg.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
