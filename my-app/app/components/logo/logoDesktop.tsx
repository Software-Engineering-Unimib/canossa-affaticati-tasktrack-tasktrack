export default function LogoDesktop(){
    return (
        <div className="hidden lg:flex items-center gap-3 px-6 h-16 border-b border-gray-100">
            <div className="flex gap-1 h-6">
                <div className="w-2 bg-blue-500 rounded-sm"></div>
                <div className="w-2 bg-green-500 rounded-sm"></div>
                <div className="w-2 bg-orange-400 rounded-sm"></div>
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">TaskTrack</span>
        </div>
    );
}