/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Shield, 
  Search, 
  Copy, 
  Check, 
  Youtube, 
  AlertTriangle, 
  Image as ImageIcon, 
  MessageSquare, 
  Hash, 
  FileText,
  Loader2,
  Terminal,
  Lock,
  Settings,
  X,
  Key,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateVideoMetadata, updateServiceApiKey, type VideoMetadata } from './services/groqService';

export default function App() {
  console.log('CyberSEO App Initialized');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [accessKey, setAccessKey] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Load keys from localStorage or use defaults with safety checks
  const [validKey, setValidKey] = useState(() => {
    try {
      return localStorage.getItem('cyber_access_key') || 'CYBER-2026';
    } catch (e) {
      return 'CYBER-2026';
    }
  });
  const [customApiKey, setCustomApiKey] = useState(() => {
    try {
      return localStorage.getItem('cyber_api_key') || '';
    } catch (e) {
      return '';
    }
  });

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessKey === validKey) {
      setIsAuthorized(true);
      setAuthError(false);
      if (customApiKey) updateServiceApiKey(customApiKey);
    } else {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 2000);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const newAccessKey = (form.elements.namedItem('newAccessKey') as HTMLInputElement).value;
    const newApiKey = (form.elements.namedItem('newApiKey') as HTMLInputElement).value;

    if (newAccessKey) {
      setValidKey(newAccessKey);
      try {
        localStorage.setItem('cyber_access_key', newAccessKey);
      } catch (e) {
        console.warn('LocalStorage access denied');
      }
    }
    
    setCustomApiKey(newApiKey);
    try {
      localStorage.setItem('cyber_api_key', newApiKey);
    } catch (e) {
      console.warn('LocalStorage access denied');
    }
    updateServiceApiKey(newApiKey);
    
    setShowSettings(false);
    alert('Settings Saved Successfully!');
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4 font-sans">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl"
        >
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-6">
              <Lock className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">System Locked</h1>
            <p className="text-zinc-500 text-sm">Please enter your authorization key to access the CyberSEO Strategist.</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="Enter Access Key"
                className={`w-full bg-zinc-950 border ${authError ? 'border-red-500' : 'border-zinc-800'} focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 px-4 text-center tracking-[0.5em] font-mono transition-all outline-none`}
              />
              {authError && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-6 left-0 right-0 text-center text-red-500 text-[10px] uppercase font-bold tracking-widest"
                >
                  Invalid Access Key
                </motion.p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Authorize Access
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
            <p className="text-[10px] text-zinc-600 uppercase tracking-[0.2em]">
              Authorized Personnel Only
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    try {
      const result = await generateVideoMetadata(topic);
      setMetadata(result);
    } catch (error: any) {
      console.error('Error generating metadata:', error);
      if (error.message === 'API_KEY_MISSING') {
        alert('Groq API Key is missing! Please add it in Settings (Gear Icon at top right).');
        setShowSettings(true);
      } else if (error.message === 'API_KEY_INVALID') {
        alert('Invalid Groq API Key! Please check your key in Settings.');
        setShowSettings(true);
      } else {
        alert('System Update: ' + (error.message || 'Failed to generate metadata. Please check your internet connection or API key.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadMetadata = () => {
    if (!metadata) return;
    const content = `
TOP 3 VIRAL TITLES:
1. SEO: ${metadata.titles.seo}
2. CTR: ${metadata.titles.ctr}
3. WARNING: ${metadata.titles.warning}

FULL DESCRIPTION:
${metadata.description.hook}

${metadata.description.about}

${metadata.description.timestamps}

${metadata.description.disclaimer}

TAGS:
${metadata.tags.join(', ')}

THUMBNAIL CONCEPT:
${metadata.thumbnail.concept}

AI PROMPT:
${metadata.thumbnail.aiPrompt}

ENGAGEMENT:
Pinned Comment: ${metadata.engagement.pinnedComment}
Social Caption: ${metadata.engagement.socialCaption}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metadata-${topic.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="border-b border-zinc-800/50 bg-zinc-900/30 backdrop-blur-xl sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Cyber<span className="text-emerald-500">SEO</span>
            </h1>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 text-xs font-mono text-zinc-500 uppercase tracking-widest"
          >
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-emerald-400"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <span className="flex items-center gap-1.5">
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-1.5 h-1.5 rounded-full bg-emerald-500" 
              />
              System Active
            </span>
          </motion.div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Settings Modal */}
        <AnimatePresence>
          {showSettings && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Settings className="w-5 h-5 text-emerald-500" />
                    System Settings
                  </h3>
                  <button onClick={() => setShowSettings(false)} className="text-zinc-500 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">
                      Access Key (Site Password)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input
                        name="newAccessKey"
                        type="text"
                        defaultValue={validKey}
                        placeholder="Change Access Key"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">
                      Groq API Key
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input
                        name="newApiKey"
                        type="password"
                        defaultValue={customApiKey}
                        placeholder="Paste Groq API Key"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-2 italic">
                      Note: This will override the default server-side API key.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Save Changes
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12 text-center max-w-2xl mx-auto"
        >
          <h2 className="text-4xl font-bold mb-4 tracking-tight text-white">
            YouTube Metadata <span className="italic font-serif text-emerald-400">Strategist</span>
          </h2>
          <p className="text-zinc-400 text-lg mb-6">
            Generate high-CTR, SEO-optimized metadata for your Cyber Security and Ethical Hacking videos.
          </p>
          {metadata && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={downloadMetadata}
              className="inline-flex items-center gap-2 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-full text-sm font-medium transition-all border border-zinc-700"
            >
              <Download className="w-4 h-4" />
              Download Full Metadata (.txt)
            </motion.button>
          )}
        </motion.div>

        {/* Input Section */}
        <motion.form 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          onSubmit={handleGenerate} 
          className="max-w-3xl mx-auto mb-16"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative flex flex-col sm:flex-row gap-3 p-2 bg-zinc-900 border border-zinc-800 rounded-2xl">
              <div className="flex-1 flex items-center px-4 gap-3">
                <Terminal className="w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter your video topic (e.g., How to secure Facebook account)"
                  className="w-full bg-transparent border-none focus:ring-0 text-zinc-100 placeholder:text-zinc-600 py-3"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !topic.trim()}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-bold px-8 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.form>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {metadata && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Column: Titles & Description */}
              <div className="lg:col-span-8 space-y-6">
                {/* Titles */}
                <motion.section 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Youtube className="w-5 h-5 text-red-500" />
                      <h3 className="font-bold uppercase text-xs tracking-widest text-zinc-400">Viral Titles</h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {[
                      { label: 'SEO Focused', value: metadata.titles.seo, icon: Search },
                      { label: 'High CTR', value: metadata.titles.ctr, icon: Youtube },
                      { label: 'Urgency/Warning', value: metadata.titles.warning, icon: AlertTriangle },
                    ].map((title, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + (i * 0.1) }}
                        whileHover={{ scale: 1.01, borderColor: 'rgba(16, 185, 129, 0.3)' }}
                        className="group relative bg-zinc-950 border border-zinc-800/50 p-4 rounded-xl transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono uppercase tracking-tighter text-zinc-500 flex items-center gap-1.5">
                            <title.icon className="w-3 h-3" />
                            {title.label}
                          </span>
                          <button
                            onClick={() => copyToClipboard(title.value, `title-${i}`)}
                            className="text-zinc-500 hover:text-emerald-400 transition-colors"
                          >
                            {copiedField === `title-${i}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-lg font-medium leading-tight">{title.value}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>

                {/* Description */}
                <motion.section 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <h3 className="font-bold uppercase text-xs tracking-widest text-zinc-400">Full Description</h3>
                    </div>
                    <button
                      onClick={() => copyToClipboard(
                        `${metadata.description.hook}\n\n${metadata.description.about}\n\n${metadata.description.timestamps}\n\n${metadata.description.disclaimer}`,
                        'full-desc'
                      )}
                      className="flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-emerald-400 transition-colors"
                    >
                      {copiedField === 'full-desc' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      Copy All
                    </button>
                  </div>
                  <div className="p-6 space-y-6 font-mono text-sm text-zinc-300">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                      <span className="text-emerald-500 mb-2 block text-xs uppercase tracking-widest">Hook</span>
                      <p className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/50">{metadata.description.hook}</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                      <span className="text-emerald-500 mb-2 block text-xs uppercase tracking-widest">About</span>
                      <p className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/50">{metadata.description.about}</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                      <span className="text-emerald-500 mb-2 block text-xs uppercase tracking-widest">Timestamps</span>
                      <pre className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/50 whitespace-pre-wrap font-mono">{metadata.description.timestamps}</pre>
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="opacity-60">
                      <span className="text-red-500 mb-2 block text-xs uppercase tracking-widest">Disclaimer</span>
                      <p className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/50 italic">{metadata.description.disclaimer}</p>
                    </motion.div>
                  </div>
                </motion.section>
              </div>

              {/* Right Column: Tags, Thumbnail, Engagement */}
              <div className="lg:col-span-4 space-y-6">
                {/* Tags */}
                <motion.section 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="w-5 h-5 text-emerald-500" />
                      <h3 className="font-bold uppercase text-xs tracking-widest text-zinc-400">High-Rank Tags</h3>
                    </div>
                    <button
                      onClick={() => copyToClipboard(metadata.tags.join(', '), 'tags')}
                      className="text-zinc-500 hover:text-emerald-400 transition-colors"
                    >
                      {copiedField === 'tags' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2">
                      {metadata.tags.map((tag, i) => (
                        <motion.span 
                          key={i} 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + (i * 0.02) }}
                          className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-400"
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.section>

                {/* Thumbnail Concept */}
                <motion.section 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-purple-500" />
                      <h3 className="font-bold uppercase text-xs tracking-widest text-zinc-400">Thumbnail Design</h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-tighter text-zinc-500 mb-1 block">Layout Concept</span>
                      <p className="text-sm text-zinc-300 leading-relaxed">{metadata.thumbnail.concept}</p>
                    </div>
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="bg-zinc-950 border border-zinc-800/50 p-4 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-tighter text-emerald-500">AI Image Prompt</span>
                        <button
                          onClick={() => copyToClipboard(metadata.thumbnail.aiPrompt, 'ai-prompt')}
                          className="text-zinc-500 hover:text-emerald-400 transition-colors"
                        >
                          {copiedField === 'ai-prompt' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <p className="text-xs text-zinc-400 italic leading-relaxed">{metadata.thumbnail.aiPrompt}</p>
                    </motion.div>
                  </div>
                </motion.section>

                {/* Engagement */}
                <motion.section 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-cyan-500" />
                      <h3 className="font-bold uppercase text-xs tracking-widest text-zinc-400">Engagement</h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <motion.div 
                      whileHover={{ x: 5 }}
                      className="bg-zinc-950 border border-zinc-800/50 p-4 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-tighter text-zinc-500">Pinned Comment</span>
                        <button
                          onClick={() => copyToClipboard(metadata.engagement.pinnedComment, 'pinned')}
                          className="text-zinc-500 hover:text-emerald-400 transition-colors"
                        >
                          {copiedField === 'pinned' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <p className="text-sm text-zinc-300">{metadata.engagement.pinnedComment}</p>
                    </motion.div>
                    <motion.div 
                      whileHover={{ x: 5 }}
                      className="bg-zinc-950 border border-zinc-800/50 p-4 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-tighter text-zinc-500">Social Caption</span>
                        <button
                          onClick={() => copyToClipboard(metadata.engagement.socialCaption, 'social')}
                          className="text-zinc-500 hover:text-emerald-400 transition-colors"
                        >
                          {copiedField === 'social' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <p className="text-sm text-zinc-300">{metadata.engagement.socialCaption}</p>
                    </motion.div>
                  </div>
                </motion.section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!metadata && !loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center justify-center py-20 text-zinc-600"
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800"
            >
              <Terminal className="w-8 h-8" />
            </motion.div>
            <p className="text-sm font-mono uppercase tracking-widest">Awaiting Input Topic...</p>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-zinc-800/50 py-12 bg-zinc-900/20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-zinc-500 text-sm mb-2">
            Designed for MR LAZY HACKER 2.0
          </p>
          <div className="flex items-center justify-center gap-4 text-xs font-mono text-zinc-600 uppercase tracking-tighter">
            <span>MR LAZY Creator Project</span>
            <span className="w-1 h-1 rounded-full bg-zinc-800" />
            <span>We Protect For Islam</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
