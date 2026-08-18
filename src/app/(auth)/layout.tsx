export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-800 to-primary relative overflow-hidden">
      {/* Decorative abstract shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-cyan-400/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-purple-500/20 blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-blue-400/20 blur-[120px]" />
      </div>
      
      {/* Main Container */}
      <div className="relative z-10 w-full px-4 sm:px-6 flex items-center justify-center">
        {children}
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 w-full text-center z-20">
        <a 
          href="/aviso-privacidad.pdf" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-white/70 hover:text-white transition-colors font-medium underline underline-offset-4 decoration-white/30"
        >
          Aviso de Privacidad Integral (PDF)
        </a>
      </div>
    </div>
  );
}
