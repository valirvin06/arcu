import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import arcuBannerImage from "@assets/486834526_1056649299817047_3489486387045719830_n.jpg";

export default function LandingPage() {
  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={arcuBannerImage} 
          alt="USTP Claveria ArCu Days 2025" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <div className="bg-black/60 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-2xl mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-2 tracking-tight">
            <span className="text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              USTP Claveria
            </span>
          </h1>
          <h2 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-wide">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-purple-400 to-orange-300 drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)]">
              ArCu Days 2025
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-4 max-w-3xl leading-relaxed">
            Live scoring platform for the University of Science and Technology 
            of Southern Philippines Claveria Arts and Culture Festival
          </p>
        </div>
        
        <Button asChild size="lg" className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:from-indigo-700 hover:via-blue-700 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.6)] transition-all duration-300 text-xl border-2 border-white/20">
          <Link to="/home">
            View Live Scores
          </Link>
        </Button>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-4 z-10 flex flex-col items-center">
        <div className="bg-black/50 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 shadow-lg">
          <div className="text-white/90 text-sm font-medium">© {new Date().getFullYear()} Val Irvin F. Mabayo</div>
        </div>
      </div>
    </div>
  );
}