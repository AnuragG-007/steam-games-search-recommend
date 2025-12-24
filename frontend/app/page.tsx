"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Bot,
  ChevronDown,
  Gamepad2,
  Search,
  Sparkles,
  ThumbsUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

export type Game = {
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
  final_score?: number
  debug?: any
}

export default function GameRecommender() {
  const [query, setQuery] = useState("")
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  const [visibleCount, setVisibleCount] = useState(8)

  const featuredGames = useMemo(() => [
    {
      title: "Cyberpunk 2077",
      image: "https://cdn.akamai.steamstatic.com/steam/apps/1091500/ss_429db1d013a0366417d650d84f1eff02d1a18c2d.1920x1080.jpg?t=1649065890",
      id: "1091500",
      position: "object-center",
    },
    {
      title: "Sekiro: Shadows Die Twice - GOTY Edition",
      image: "https://cdn.akamai.steamstatic.com/steam/apps/814380/ss_15f0e9982621aed44900215ad283811af0779b1d.1920x1080.jpg?t=1603904569",
      id: "814380",
      position: "object-[center_30%]",
    },
    {
      title: "God of War",
      image: "https://cdn.akamai.steamstatic.com/steam/apps/1593500/ss_1bd99270dcbd4ff9fe9c94b0d9c8ffc50ebb42c7.1920x1080.jpg",
      id: "1593500",
      position: "object-top",
    },
    {
      title: "The Elder Scrolls V: Skyrim",
      image: "https://cdn.akamai.steamstatic.com/steam/apps/72850/ss_038abb71457edf636529dd7b5f898a7311dea359.1920x1080.jpg?t=1647357402",
      id: "72850",
      position: "object-center",
    },
    {
      title: "The Witcher 3: Wild Hunt",
      image: "https://cdn.akamai.steamstatic.com/steam/apps/292030/ss_eda99e7f705a113d04ab2a7a36068f3e7b343d17.1920x1080.jpg?t=1646996408",
      id: "292030",
      position: "object-center",
    },
    {
      title: "Assassin's Creed Odyssey",
      image: "https://cdn.akamai.steamstatic.com/steam/apps/812140/ss_0ef33c0f230da6ebac94f5959f0e0a8bbc48cf8a.1920x1080.jpg?t=1646425720",
      id: "812140",
      position: "object-center",
    },
  ], [])

  const trendingTags = [
    "Cozy", "Cyberpunk", "RPG", "Open World", "Survival",
    "Roguelike", "FPS", "Horror", "Strategy", "Indie",
  ]

  const { toast } = useToast()
  const router = useRouter()

  const API_BASE = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % featuredGames.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [featuredGames.length])

  const scrollToDiscover = () => {
    const el = document.getElementById("discover")
    if (!el) return
    el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Describe your vibe",
        description: "Try something like “Cozy farming sim with pixel art”.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setHasSearched(true)
    setVisibleCount(8)

    try {
      const response = await fetch(`${API_BASE}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, top_k: 64 }),
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data: Game[] = await response.json()
      setGames(data)
    } catch (error) {
      console.error("API Error:", error)
      toast({
        title: "Search failed",
        description: "Could not fetch recommendations. Check the API URL / backend.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 8)
  }

  const openGameDetails = (game: Game) => {
    localStorage.setItem("selectedGame", JSON.stringify(game))
    router.push(`/game/${game.id}`)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 relative selection:bg-purple-500/30 font-sans overflow-x-hidden">
      {/* Background FX */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/75 backdrop-blur-md transition-all duration-300">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 shadow-[0_0_18px_rgba(147,51,234,0.4)] flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              GAMEFINDER
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-neutral-400 hover:text-white hover:bg-white/5 transition-colors gap-2"
              onClick={scrollToDiscover}
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </Button>

            <Button
              variant="ghost"
              className="text-neutral-400 hover:text-white hover:bg-white/5 transition-colors group gap-2"
              asChild
            >
              <Link href="/chat">
                <Bot className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                <span className="font-medium">AI Chat</span>
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative w-full h-[calc(100svh-64px)] min-h-[520px] bg-black border-b border-white/5 overflow-hidden">
        
        {/* BACKGROUND LAYER */}
        <div className="absolute inset-0 z-0">
           <AnimatePresence mode="popLayout">
              {featuredGames.map((game, index) => (
                 index === currentImageIndex && (
                    <motion.div
                       key={game.id}
                       initial={{ opacity: 0 }} 
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0 }}
                       transition={{ opacity: { duration: 1.5, ease: "easeInOut" } }}
                       className="absolute inset-0 w-full h-full overflow-hidden"
                    >
                       <motion.img
                          src={game.image}
                          alt={game.title}
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 6, ease: "linear" }}
                          className={`w-full h-full object-cover opacity-60 ${game.position}`}
                       />
                    </motion.div>
                 )
              ))}
           </AnimatePresence>
        </div>

        {/* STATIC COURTESY TAG */}
        <div className="absolute top-6 right-6 md:top-10 md:right-10 z-20">
           <AnimatePresence mode="wait">
              <motion.div 
                 key={currentImageIndex}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 transition={{ duration: 0.5 }}
                 className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] md:text-xs font-medium text-neutral-300 uppercase tracking-wider shadow-lg"
              >
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                 Courtesy: {featuredGames[currentImageIndex]?.title}
              </motion.div>
           </AnimatePresence>
        </div>

        {/* STATIC CONTENT */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center px-4 md:px-6">
            <motion.div
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, ease: "easeOut" }}
               className="space-y-6 max-w-5xl"
            >
               <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-purple-300 mb-2 mx-auto backdrop-blur-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>AI-Powered Recommendations</span>
               </div>

               <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] leading-[0.9]">
                  DISCOVER YOUR <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                     NEXT OBSESSION
                  </span>
               </h1>

               <p className="text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md">
                  Stop searching, start playing. Our AI analyzes your unique gaming vibe to find hidden gems you'll love.
               </p>

               <div className="pt-6">
                  <Button
                     onClick={scrollToDiscover}
                     className="h-14 px-8 rounded-full bg-white text-black hover:bg-neutral-200 font-bold text-lg transition-transform hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                  >
                     Start Exploring
                  </Button>
               </div>
            </motion.div>
        </div>
        
        {/* OVERLAYS */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-black/30 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none z-0" />
      </section>

      {/* SEARCH SECTION */}
      <section
        id="discover"
        className="relative z-10 container mx-auto px-6 scroll-mt-24"
      >
        <div className="py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-4xl mx-auto space-y-10"
          >
             <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-[20px] opacity-20 group-focus-within:opacity-50 blur transition duration-500" />
                <form
                   onSubmit={(e) => {
                      e.preventDefault()
                      handleSearch()
                   }}
                   className="relative flex items-center bg-[#0a0a0a] rounded-2xl border border-white/10 p-2 shadow-2xl"
                >
                   <Search className="ml-4 w-6 h-6 text-neutral-500" />
                   <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Describe your vibe (e.g. 'Cyberpunk RPG with great story')..."
                      className="flex-1 bg-transparent border-none px-4 py-4 text-lg text-white placeholder:text-neutral-500 focus:ring-0 focus:outline-none"
                   />
                   <Button
                      type="submit"
                      disabled={loading}
                      className="h-12 px-8 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold"
                   >
                      {loading ? (
                         <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      ) : (
                         "Search"
                      )}
                   </Button>
                </form>
             </div>

            {/* Tags */}
            <div className="flex flex-wrap justify-center gap-2">
              {trendingTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-5 py-2 text-sm font-medium rounded-full bg-white/5 border border-white/5 text-neutral-400 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all active:scale-95 hover:-translate-y-0.5"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Initial State Placeholder */}
            {!hasSearched && (
              <div className="pt-8 pb-12 flex flex-col items-center text-center opacity-60 hover:opacity-100 transition-opacity duration-500">
                <Gamepad2 className="w-10 h-10 text-neutral-600 mb-4" />
                <p className="text-lg text-neutral-300 font-medium">
                  Ready to play?
                </p>
                <p className="text-sm text-neutral-500">
                  Type a genre, mood, or game title above to get started.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* RESULTS SECTION */}
      <AnimatePresence>
        {hasSearched && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="container mx-auto px-6 pb-24 relative z-10"
          >
            <div className="max-w-[1400px] mx-auto">
              <div className="flex items-center gap-4 mb-12">
                <div className="h-10 w-1.5 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
                <h3 className="text-4xl font-bold text-white tracking-tighter">
                  Curated For You
                </h3>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="aspect-[16/9] w-full rounded-2xl bg-neutral-900/50" />
                      <div className="space-y-3">
                        <Skeleton className="h-5 w-3/4 bg-neutral-900/50" />
                        <Skeleton className="h-4 w-1/2 bg-neutral-900/50" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : games.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
                    {/* 5. SLICE THE ARRAY BASED ON VISIBLE COUNT */}
                    {games.slice(0, visibleCount).map((g, i) => (
                      <GameCard
                        key={g.id}
                        game={g}
                        index={i}
                        onClick={() => openGameDetails(g)}
                      />
                    ))}
                  </div>
                  
                  {/* 6. SHOW MORE BUTTON */}
                  {visibleCount < games.length && (
                    <div className="flex justify-center pb-12">
                        <Button 
                            onClick={handleShowMore}
                            variant="outline"
                            className="h-12 px-8 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white hover:text-purple-400 gap-2 transition-all hover:scale-105"
                        >
                            Show More Games <ChevronDown className="w-4 h-4" />
                        </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-32 border border-white/5 rounded-[32px] bg-white/[0.02]">
                  <p className="text-2xl text-neutral-200 font-semibold mb-3">
                    No signals found.
                  </p>
                  <p className="text-neutral-500">
                    Try broader terms like “Action RPG” or “Sci-Fi Shooter”.
                  </p>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="mt-auto bg-[#020202] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-5 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-900/30">
                  <Gamepad2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-xl tracking-tight">
                  GAMEFINDER
                </span>
              </div>
              <p className="text-sm text-neutral-400 max-w-sm leading-relaxed">
                An AI-powered discovery engine for Steam enthusiasts.
                Stop scrolling and start playing—find your next adventure
                based on your unique vibe.
              </p>
            </div>

            <div className="md:col-span-3 space-y-5">
              <h4 className="text-xs font-bold tracking-widest uppercase text-white">
                Explore
              </h4>
              <ul className="space-y-3 text-sm text-neutral-500">
                <li><Link href="/chat" className="hover:text-purple-400 transition">AI Assistant</Link></li>
                <li><button onClick={scrollToDiscover} className="hover:text-purple-400 transition text-left">Search Games</button></li>
                <li><a href="#" className="hover:text-purple-400 transition">Trending Now</a></li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-5">
              <h4 className="text-xs font-bold tracking-widest uppercase text-white">
                Legal
              </h4>
              <ul className="space-y-3 text-sm text-neutral-500">
                <li><a href="#" className="hover:text-purple-400 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">API Status</a></li>
              </ul>
            </div>
          </div>

          <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-neutral-500">
            <div className="flex items-center gap-1">
              <span>© 2025 GameFinder.</span>
              <span>
                Crafted by{" "}
                <span className="text-neutral-300 font-medium">
                  Anurag Gaikwad
                </span>
              </span>
            </div>

            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition">GitHub</a>
              <a href="#" className="hover:text-white transition">Twitter</a>
              <a href="#" className="hover:text-white transition">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function GameCard({
  game,
  index,
  onClick,
}: {
  game: Game
  index: number
  onClick: () => void
}) {
  const [isHovering, setIsHovering] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const getImage = () => {
    if (game.image?.startsWith("http")) return game.image
    return `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.id}/header.jpg`
  }

  const displayImage =
    isHovering && game.screenshots?.length
      ? game.screenshots[currentImageIndex]
      : getImage()

  useEffect(() => {
    if (!isHovering || !game.screenshots?.length) return
    const interval = setInterval(() => {
      setCurrentImageIndex((p) => (p + 1) % game.screenshots.length)
    }, 950)
    return () => clearInterval(interval)
  }, [isHovering, game.screenshots])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="group relative bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/5 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-900/10 transition-all duration-500 cursor-pointer h-full flex flex-col"
      tabIndex={0}
    >
      <div className="relative aspect-[16/9] bg-neutral-900 overflow-hidden">
        <img
          src={displayImage}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

        {game.metacritic > 0 && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg">
            <span
              className={
                game.metacritic >= 80 ? "text-green-400" : "text-yellow-400"
              }
            >
              {game.metacritic}
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 gap-3">
        <h3 className="font-bold text-neutral-100 line-clamp-1 text-lg group-hover:text-purple-400 transition-colors duration-300">
          {game.title}
        </h3>

        <div className="flex flex-wrap gap-1.5 text-[10px] text-neutral-500 font-semibold uppercase tracking-wide">
          {(game.tags || []).slice(0, 3).map((t) => (
            <span
              key={t}
              className="bg-white/5 px-2 py-1 rounded-md border border-white/5 group-hover:border-white/10 transition-colors"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between text-sm pt-4 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span className="font-medium">
              {Math.round((game.positive_ratio || 0) * 100)}%
            </span>
          </div>

          <span className="font-bold text-white bg-white/10 px-3 py-1 rounded-lg border border-white/5 group-hover:bg-purple-600 group-hover:border-purple-500 transition-all duration-300 shadow-lg">
            {String(game.price) === "0" ? "Free" : `$${game.price}`}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
