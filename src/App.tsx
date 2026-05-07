import { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { 
  Newspaper, 
  Send, 
  RotateCcw, 
  ExternalLink, 
  Tag as TagIcon, 
  CheckCircle2, 
  XCircle,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Category, NewsGenerationResult } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const CATEGORIES: Category[] = ['Teknologi', 'Politik', 'Sosial', 'Hiburan', 'Olahraga', 'Lingkungan'];

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NewsGenerationResult | null>(null);
  const [userChoice, setUserChoice] = useState<'setuju' | 'tidak setuju' | null>(null);

  const generateContent = async () => {
    if (!url) return;
    
    // Simple URL validation
    try {
      new URL(url);
    } catch {
      setError('Mohon masukkan URL yang valid.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setUserChoice(null);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analisa artikel berita dari link berikut: ${url}. 
        Berikan output dalam bahasa Indonesia dengan format JSON sebagai berikut:
        {
          "pertanyaan": "Pertanyaan ya/tidak yang memicu opini kritis tentang isu di berita tersebut",
          "deskripsi": "Deskripsi singkat yang memberikan konteks tambahan seputar berita tersebut",
          "kategori": "Pilih salah satu dari: Teknologi, Politik, Sosial, Hiburan, Olahraga, Lingkungan",
          "tags": ["tag1", "tag2", "tag3"]
        }`,
        config: {
          tools: [{ urlContext: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              pertanyaan: { type: Type.STRING },
              deskripsi: { type: Type.STRING },
              kategori: { type: Type.STRING, enum: CATEGORIES },
              tags: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
            },
            required: ["pertanyaan", "deskripsi", "kategori", "tags"]
          }
        },
      });

      const data = JSON.parse(response.text);
      setResult({
        ...data,
        linkNews: url
      });
    } catch (err) {
      console.error(err);
      setError('Gagal memproses berita. Pastikan link dapat diakses atau coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUrl('');
    setResult(null);
    setError(null);
    setUserChoice(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#00FF00] selection:text-black">
      {/* Header */}
      <header className="border-b border-white/10 p-6 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00FF00] rounded-none flex items-center justify-center rotate-3">
            <Newspaper className="text-black w-6 h-6 -rotate-3" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tighter uppercase italic">NewsQuest AI</h1>
            <p className="text-[10px] text-white/50 tracking-widest uppercase">Intelligent News Analysis</p>
          </div>
        </div>
        <button 
          onClick={handleReset}
          className="p-2 hover:bg-white/5 rounded-full transition-colors group"
          title="Reset"
        >
          <RotateCcw className="w-5 h-5 text-white/40 group-hover:text-[#00FF00] transition-colors" />
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-6 pt-12">
        {/* Input Section */}
        <section className="mb-12">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00FF00] to-cyan-500 rounded-none blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Masukkan link berita di sini..."
                className="flex-1 bg-black border border-white/20 p-4 text-white focus:outline-none focus:border-[#00FF00] transition-colors font-mono text-sm"
                onKeyPress={(e) => e.key === 'Enter' && generateContent()}
              />
              <button 
                onClick={generateContent}
                disabled={loading || !url}
                className="bg-[#00FF00] text-black px-8 py-4 font-bold uppercase tracking-tight hover:bg-[#00CC00] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Generate</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 border border-red-500/50 bg-red-500/10 text-red-400 text-sm flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="space-y-8"
            >
              {/* Main Question Card */}
              <div className="border border-white/10 bg-[#111] overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4">
                  <span className="px-3 py-1 bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest">
                    {result.kategori}
                  </span>
                </div>
                
                <div className="p-8 md:p-12">
                  <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-12 max-w-2xl leading-tight">
                    {result.pertanyaan}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      onClick={() => setUserChoice('setuju')}
                      className={`group p-6 flex items-center justify-between border transition-all ${
                        userChoice === 'setuju' 
                          ? 'border-[#00FF00] bg-[#00FF00]/10' 
                          : 'border-white/10 bg-white/5 hover:border-white/30'
                      }`}
                    >
                      <span className={`font-bold uppercase tracking-widest ${userChoice === 'setuju' ? 'text-[#00FF00]' : 'text-white/60'}`}>Setuju</span>
                      <CheckCircle2 className={`w-6 h-6 transition-transform group-hover:scale-110 ${userChoice === 'setuju' ? 'text-[#00FF00]' : 'text-white/20'}`} />
                    </button>
                    <button 
                      onClick={() => setUserChoice('tidak setuju')}
                      className={`group p-6 flex items-center justify-between border transition-all ${
                        userChoice === 'tidak setuju' 
                          ? 'border-red-500 bg-red-500/10' 
                          : 'border-white/10 bg-white/5 hover:border-white/30'
                      }`}
                    >
                      <span className={`font-bold uppercase tracking-widest ${userChoice === 'tidak setuju' ? 'text-red-500' : 'text-white/60'}`}>Tidak Setuju</span>
                      <XCircle className={`w-6 h-6 transition-transform group-hover:scale-110 ${userChoice === 'tidak setuju' ? 'text-red-500' : 'text-white/20'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Meta Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Description */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Konteks & Deskripsi</h3>
                  <div className="border-l-2 border-[#00FF00] pl-6 py-2">
                    <p className="text-lg text-white/80 leading-relaxed italic font-serif">
                      "{result.deskripsi}"
                    </p>
                  </div>
                </div>

                {/* Details side */}
                <div className="space-y-8">
                  {/* Tags */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.tags.map((tag) => (
                        <div key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/5 text-xs text-white/60">
                          <TagIcon className="w-3 h-3" />
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* News Link */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Sumber Berita</h3>
                    <a 
                      href={result.linkNews} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 group text-[#00FF00] hover:text-white transition-colors"
                    >
                      <span className="text-sm font-mono truncate max-w-[200px] md:max-w-xs">{result.linkNews}</span>
                      <ExternalLink className="w-4 h-4 shrink-0" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {!result && !loading && (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-20 text-center flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-none bg-white/[0.02]"
            >
              <div className="w-16 h-16 bg-white/5 flex items-center justify-center mb-6">
                <Newspaper className="text-white/20 w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white/60 uppercase tracking-widest mb-2 italic">Siap Menganalisa</h2>
              <p className="text-white/30 text-sm max-w-xs mx-auto leading-relaxed">
                Tempel link berita di atas untuk mengenerate pertanyaan interaktif dan metadata otomatis.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-20 border-t border-white/10 p-12 text-center">
        <p className="text-[10px] text-white/20 tracking-[0.4em] uppercase font-bold">
          Powered by Gemini AI • 2024 NewsQuest Data Labs
        </p>
      </footer>
    </div>
  );
}
