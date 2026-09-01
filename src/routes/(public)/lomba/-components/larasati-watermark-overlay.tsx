import * as React from "react";

interface LarasatiWatermarkOverlayProps {
  className?: string;
}

export function LarasatiWatermarkOverlay({ className }: LarasatiWatermarkOverlayProps) {
  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-0 pointer-events-none select-none flex items-end justify-end overflow-hidden ${
        className || ""
      }`}
    >
      <img
        src="/images/larasati-full-body.png"
        alt=""
        className="h-[130vh] sm:h-[150vh] lg:h-[170vh] xl:h-[185vh] w-auto max-w-[95vw] sm:max-w-[85vw] lg:max-w-[78vw] xl:max-w-[75vw] object-contain object-bottom-right opacity-22 sm:opacity-26 lg:opacity-30 transition-all duration-700 pointer-events-none translate-x-[22%] sm:translate-x-[28%] lg:translate-x-[34%] xl:translate-x-[38%] translate-y-[2%]"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = "/images/larasati.png";
        }}
      />
    </div>
  );
}
