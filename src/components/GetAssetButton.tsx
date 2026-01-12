import React from "react";
import { MessageCircle, Loader2 } from "lucide-react";

type GetAssetButtonProps = {
    onClick: () => void;
    disabled?: boolean;
    isExporting: boolean;
};

export const GetAssetButton = ({ onClick, disabled, isExporting }: GetAssetButtonProps) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="group relative overflow-hidden bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-8 rounded-xl transition-all w-full shadow-[0_0_20px_rgba(34,197,94,0.4)] disabled:opacity-50 disabled:grayscale"
        >
            <span className="absolute inset-0 w-full h-full -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent transform" />
            <div className="relative flex items-center justify-center gap-2">
                {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
                <span>{isExporting ? "ENGINEERING..." : "SEND TO WHATSAPP"}</span>
            </div>
        </button>
    );
};
