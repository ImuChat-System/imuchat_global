'use client';

interface PhoneMockupProps {
  children?: React.ReactNode;
  className?: string;
}

export default function PhoneMockup({ children, className = "" }: PhoneMockupProps) {
  return (
    <div className={`relative mx-auto border-slate-800 bg-slate-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl ${className}`}>
      <div className="h-[32px] w-[3px] bg-slate-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
      <div className="h-[46px] w-[3px] bg-slate-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
      <div className="h-[46px] w-[3px] bg-slate-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
      <div className="h-[64px] w-[3px] bg-slate-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
      <div className="rounded-[2rem] overflow-hidden w-full h-full bg-slate-900 border-[4px] border-slate-800 relative">
         {/* Dynamic Island / Notch */}
         <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-slate-950 rounded-b-xl z-20"></div>
         
         {/* Screen Content */}
         <div className="w-full h-full bg-slate-950 text-white overflow-hidden relative">
            {children ? children : (
                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
                    <div className="w-16 h-16 rounded-2xl bg-primary-500/20 animate-pulse"></div>
                    <p className="text-sm font-medium">ImuChat App</p>
                </div>
            )}
            
            {/* Status Bar Fake */}
            <div className="absolute top-2 right-4 flex gap-1">
                <div className="w-4 h-2 bg-white rounded-sm opacity-80"></div>
                <div className="w-3 h-2 bg-white rounded-sm opacity-80"></div>
            </div>
         </div>
      </div>
    </div>
  );
}
