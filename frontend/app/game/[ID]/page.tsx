"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, Play, ThumbsUp, Calendar, 
  ChevronRight, ChevronLeft, Star, Users, 
  Monitor, ShieldCheck, Gamepad2, Share2, 
  Maximize2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"

// --- TYPES (Same as Home) ---
type Game = {
  id: string
  title: string
  description: string
  genres: string[]
  tags: string[]
  price: string | number
  image: string
  score: number
  reviews: number
  positive_ratio: number
  metacritic: number
  release_date: string
  screenshots: string[]
  trailer: string
}

export default function GameDetailPage() {
  const [game, setGame] = useState<Game | null>(null)
  const [activeMedia, setActiveMedia] = useState<string | null>(null)
  const [isVideo, setIsVideo] = useState(false)
  const [mediaIndex, setMediaIndex] = useState(0)
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('selectedGame')
    if (stored) {
      const parsed = JSON.parse(stored)
      setGame(parsed)
      
      // Initialize Media
      if (parsed.trailer) {
        setActiveMedia(parsed.trailer)
        setIsVideo(true)
      } else {
        setActiveMedia(parsed.image)
        setIsVideo(false)
      }
    } else {
        router.push('/')
    }
  }, [router])

  // --- LOADING STATE ---
  if (!game) return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
          <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              <span className="text-neutral-500 text-sm tracking-widest uppercase animate-pulse">Initializing Interface...</span>
          </div>
      </div>
  )

  const getHeaderImage = () => {
     if (game.image?.startsWith('http')) return game.image;
     return `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.id}/header.jpg`
  }

  const mediaList = [
    ...(game.trailer ? [{ type: 'video', url: game.trailer, thumb: getHeaderImage() }] : []),
    ...(game.screenshots || []).map(s => ({ type: 'image', url: s, thumb: s }))
  ]

  const updateMedia = (index: number) => {
    setMediaIndex(index)
    const item = mediaList[index]
    setActiveMedia(item.url)
    setIsVideo(item.type === 'video')
  }

  // --- NAVIGATION FUNCTIONS ---
  const handleNextMedia = (e: React.MouseEvent) => {
    e.stopPropagation()
    const nextIndex = (mediaIndex + 1) % mediaList.length
    updateMedia(nextIndex)
  }

  const handlePrevMedia = (e: React.MouseEvent) => {
    e.stopPropagation()
    const prevIndex = (mediaIndex - 1 + mediaList.length) % mediaList.length
    updateMedia(prevIndex)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-purple-500/30 overflow-x-hidden">
      
      {/* --- BACKGROUND FX --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-neutral-400 hover:text-white transition-colors group">
             <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors border border-white/5 group-hover:border-white/20">
                <ArrowLeft className="w-4 h-4" />
             </div>
             <span className="font-bold text-sm tracking-wide">BACK TO SEARCH</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-4 text-xs font-medium text-neutral-500">
                <span className="px-2 py-1 rounded bg-white/5 border border-white/5">APP ID: {game.id}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                <span className="tracking-widest uppercase">System Online</span>
          </div>
        </div>
      </nav>

      {/* --- HERO BANNER --- */}
      <div className="relative w-full h-[60vh] lg:h-[70vh] overflow-hidden">
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 z-0"
          >
             <img src={getHeaderImage()} className="w-full h-full object-cover object-top opacity-60" />
             <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
             <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent" />
          </motion.div>
          
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10">
              <div className="container mx-auto">
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-4xl space-y-6"
                  >
                      <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-bold uppercase tracking-wider border border-purple-500/20 backdrop-blur-md shadow-[0_0_15px_-3px_rgba(168,85,247,0.4)]">
                              {game.genres[0] || "Featured"}
                          </span>
                          {game.release_date && (
                              <span className="text-neutral-400 text-sm font-medium">
                                  {new Date(game.release_date).getFullYear()}
                              </span>
                          )}
                      </div>

                      <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white drop-shadow-2xl leading-[0.9]">
                          {game.title}
                      </h1>

                      <div className="flex flex-wrap gap-2 pt-2">
                          {game.genres.slice(0, 4).map(g => (
                              <Badge key={g} variant="outline" className="bg-white/5 hover:bg-white/10 text-neutral-300 border-white/10 px-3 py-1 text-xs tracking-wide transition-colors">
                                  {g}
                              </Badge>
                          ))}
                      </div>
                  </motion.div>
              </div>
          </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <main className="container mx-auto px-6 py-12 relative z-10 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-8 space-y-12">
                
                {/* Media Player with Navigation */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4"
                >
                    <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] group ring-1 ring-white/5">
                        
                        {/* Media Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeMedia}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="w-full h-full flex items-center justify-center bg-black"
                            >
                                {isVideo && activeMedia ? (
                                    <video 
                                        ref={videoRef}
                                        src={activeMedia} 
                                        poster={getHeaderImage()} 
                                        controls 
                                        autoPlay 
                                        muted={false}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <img 
                                        src={activeMedia || getHeaderImage()} 
                                        alt={game.title}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Overlay - Shows on Hover */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button 
                                onClick={handlePrevMedia} 
                                className="pointer-events-auto p-3 bg-black/60 hover:bg-purple-600 rounded-full text-white backdrop-blur-md border border-white/10 transition-all transform hover:scale-110 shadow-lg"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button 
                                onClick={handleNextMedia} 
                                className="pointer-events-auto p-3 bg-black/60 hover:bg-purple-600 rounded-full text-white backdrop-blur-md border border-white/10 transition-all transform hover:scale-110 shadow-lg"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>

                    </div>

                    {/* Thumbnail Strip */}
                    <div className="flex gap-3 overflow-x-auto pb-2 pt-2 scrollbar-hide mask-fade-right">
                        {mediaList.map((item, i) => (
                             <button 
                                key={i}
                                onClick={() => updateMedia(i)}
                                className={`flex-shrink-0 w-28 md:w-36 aspect-video rounded-lg overflow-hidden border relative transition-all duration-300 ${mediaIndex === i ? 'border-purple-500 ring-2 ring-purple-500/20 opacity-100' : 'border-white/10 opacity-50 hover:opacity-80 hover:border-white/30'}`}
                             >
                                <img src={item.thumb} className="w-full h-full object-cover" />
                                {item.type === 'video' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                                        <Play className="w-8 h-8 text-white fill-white opacity-90" />
                                    </div>
                                )}
                             </button>
                        ))}
                    </div>
                </motion.div>

                {/* Description */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="prose prose-invert prose-lg max-w-none"
                >
                    <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                        <Monitor className="w-5 h-5 text-purple-400" />
                        <h3 className="text-xl font-bold text-white m-0 tracking-tight">About The Game</h3>
                    </div>
                    <div className="text-neutral-300 leading-relaxed font-light text-base md:text-lg opacity-90">
                        {game.description}
                    </div>
                </motion.div>

                {/* Tags */}
                <div>
                     <div className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-4">Discoverability Tags</div>
                     <div className="flex flex-wrap gap-2">
                        {game.tags.map(t => (
                            <span key={t} className="text-xs font-medium text-neutral-400 bg-white/[0.03] border border-white/5 px-3 py-1.5 rounded-full hover:bg-white/10 hover:text-white hover:border-white/20 transition-all cursor-default">
                                #{t}
                            </span>
                        ))}
                     </div>
                </div>
            </div>

            {/* RIGHT COLUMN (Sticky Sidebar) */}
            <div className="lg:col-span-4">
                <div className="sticky top-24 space-y-6">
                    
                    {/* Action Card */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] group-hover:bg-purple-600/30 transition-colors duration-700" />
                        
                        <div className="relative z-10 space-y-6">
                            <div>
                                <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Current Price</div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-white tracking-tight">
                                        {game.price === "0" ? "Free" : `$${game.price}`}
                                    </span>
                                    {game.price !== "0" && <span className="text-sm text-neutral-500 line-through decoration-white/20">$59.99</span>}
                                </div>
                            </div>

                            <Button className="w-full h-14 text-base font-bold rounded-xl bg-white text-black hover:bg-neutral-200 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]" asChild>
                                <a href={`https://store.steampowered.com/app/${game.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                                   <Gamepad2 className="w-5 h-5" />
                                   Get on Steam
                                </a>
                            </Button>

                            <div className="grid grid-cols-2 gap-3 text-center">
                                <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                    <div className="text-[10px] text-neutral-500 uppercase font-bold">Metacritic</div>
                                    <div className={`text-2xl font-bold ${game.metacritic >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {game.metacritic || "--"}
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                    <div className="text-[10px] text-neutral-500 uppercase font-bold">Rating</div>
                                    <div className="text-2xl font-bold text-blue-400">
                                        {Math.round(game.positive_ratio * 100)}%
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Released</span>
                                    <span className="text-neutral-300">{game.release_date || "TBA"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500 flex items-center gap-2"><Users className="w-4 h-4" /> Reviews</span>
                                    <span className="text-neutral-300">{game.reviews.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> DRM</span>
                                    <span className="text-neutral-300">Steam Cloud</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Share / Extra Actions */}
                    <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 bg-transparent border-white/10 hover:bg-white/5 text-neutral-400 hover:text-white">
                            <Share2 className="w-4 h-4 mr-2" /> Share
                        </Button>
                        <Button variant="outline" className="flex-1 bg-transparent border-white/10 hover:bg-white/5 text-neutral-400 hover:text-white">
                            <Star className="w-4 h-4 mr-2" /> Wishlist
                        </Button>
                    </div>

                </div>
            </div>
        </div>
      </main>
    </div>
  )
}
