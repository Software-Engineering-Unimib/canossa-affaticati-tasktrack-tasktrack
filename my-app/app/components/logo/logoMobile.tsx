export default function LogoMobile() {
    return(
        <div className="flex items-center gap-2">
            <div className="flex gap-1 h-5">
                <div className="w-1.5 bg-blue-500 rounded-sm"></div>
                <div className="w-1.5 bg-green-500 rounded-sm"></div>
                <div className="w-1.5 bg-orange-400 rounded-sm"></div>
            </div>
            <span className="font-bold text-lg text-slate-800">TaskTrack</span>
        </div>
    );
}