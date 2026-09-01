import * as React from "react";
import {
  Check,
  Eye,
  Hand,
  ImageIcon,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
  ZoomIn,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Kasus } from "@/routes/(admin)/dashboard/master/kasus/-components/data";
import { playCtaClickSound } from "./lomba-sound-effects";

interface McqOption {
  id: string;
  label: string;
  category?: string;
  isCorrect?: boolean;
}

const FALLBACK_MCQ_OPTIONS: McqOption[] = [
  {
    id: "opt-a",
    label: "A. Normal (Epitel skuamosa licin, SSK tampak jelas, tanpa plak asetowhite)",
    category: "Temuan Fisiologis",
  },
  {
    id: "opt-b",
    label: "B. Servisitis Akut (Eritema difus, sekret mukopurulen, tanpa batas tegas asetowhite)",
    category: "Infeksi Benigna",
  },
  {
    id: "opt-c",
    label: "C. IVA Positif dengan Lesi Luas / Mencurigakan Keganasan",
    category: "Lesi Pra-Kanker Serviks",
    isCorrect: true,
  },
  {
    id: "opt-d",
    label: "D. Kanker Serviks Invasif (Massa eksofitik rapuh, mudah berdarah spontan)",
    category: "Malignansi",
  },
];

interface ClinicalImage {
  id: string;
  title: string;
  description: string;
  url: string;
  isPrimary?: boolean;
}

const FALLBACK_CLINICAL_IMAGES: ClinicalImage[] = [
  {
    id: "img-1",
    title: "Foto 1: Pasca Aplikasi Asam Asetat 3-5%",
    description: "Tampak jelas plak putih pekat (Acetowhite epithelium) tebal dengan batas tegas menyentuh garis SSK porsio.",
    url: "/images/pos4-pasien1.jfif",
    isPrimary: true,
  },
  {
    id: "img-2",
    title: "Foto 2: Tampilan Makroskopis Serviks Polos",
    description: "Inspeksi visual serviks dengan spekulum cocor bebek sebelum aplikasi asam asetat.",
    url: "/images/pos4-pasien1.jfif",
    isPrimary: false,
  },
];

interface Step5InterpretasiMcqProps {
  selectedOptionId?: string;
  onSelectOption?: (optionId: string) => void;
  kasus?: Kasus;
}

export function Step5InterpretasiMcq({
  selectedOptionId: initialOptionId,
  onSelectOption,
  kasus,
}: Step5InterpretasiMcqProps) {
  const clinicalImages: ClinicalImage[] = React.useMemo(() => {
    const rawImages = kasus?.stase_data?.stase4?.images;
    if (rawImages && rawImages.length > 0) {
      return rawImages.map((img, idx) => {
        if (typeof img === "string") {
          return {
            id: `img-${idx + 1}`,
            title: `Foto Serviks Pasca Asam Asetat #${idx + 1}`,
            description: kasus.stase_data.stase4.header.petunjuk_soal || "Foto inspeksi visual serviks",
            url: img,
            isPrimary: idx === 0,
          };
        }
        return {
          id: img.id,
          title: img.nama || `Foto Serviks #${idx + 1}`,
          description: img.keterangan || kasus.stase_data.stase4.header.petunjuk_soal || "",
          url: img.url,
          isPrimary: idx === 0,
        };
      });
    }
    return FALLBACK_CLINICAL_IMAGES;
  }, [kasus]);

  const mcqOptions: McqOption[] = React.useMemo(() => {
    const rawOptions = kasus?.stase_data?.stase4?.pilihan_jawaban;
    if (rawOptions && rawOptions.length > 0) {
      return rawOptions.map((opt) => ({
        id: opt.id,
        label: opt.label,
        isCorrect: opt.is_correct,
      }));
    }
    return FALLBACK_MCQ_OPTIONS;
  }, [kasus]);

  const [selectedId, setSelectedId] = React.useState<string>(initialOptionId || "");
  const [highlightedImageId, setHighlightedImageId] = React.useState<string>(
    clinicalImages[0]?.id || "img-1",
  );
  const [zoomScale, setZoomScale] = React.useState<number>(1);
  const [panPosition, setPanPosition] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });

  React.useEffect(() => {
    if (clinicalImages.length > 0) {
      setHighlightedImageId(clinicalImages[0].id);
    }
    setSelectedId("");
  }, [kasus]);

  const canvasRef = React.useRef<HTMLDivElement>(null);
  const zoomScaleRef = React.useRef(zoomScale);
  zoomScaleRef.current = zoomScale;

  const activeImage = clinicalImages.find((img) => img.id === highlightedImageId) || clinicalImages[0];

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.4, 3.5));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => {
      const next = Math.max(prev - 0.4, 1);
      if (next === 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // Native Non-Passive Event Listeners for Wheel & Touch Pinch
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = e.deltaY < 0 ? 0.25 : -0.25;
      setZoomScale((prev) => {
        const next = Math.min(Math.max(prev + zoomDelta, 1), 3.5);
        if (next === 1) setPanPosition({ x: 0, y: 0 });
        return next;
      });
    };

    let touchStartDist: number | null = null;
    let initialPinchZoom = 1;

    const onTouchStartNative = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        initialPinchZoom = zoomScaleRef.current;
      }
    };

    const onTouchMoveNative = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchStartDist !== null) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        const scaleFactor = dist / touchStartDist;
        const nextZoom = Math.min(Math.max(initialPinchZoom * scaleFactor, 1), 3.5);
        setZoomScale(nextZoom);
        if (nextZoom === 1) setPanPosition({ x: 0, y: 0 });
      }
    };

    const onTouchEndNative = () => {
      touchStartDist = null;
    };

    canvas.addEventListener("wheel", onWheelNative, { passive: false });
    canvas.addEventListener("touchstart", onTouchStartNative, { passive: false });
    canvas.addEventListener("touchmove", onTouchMoveNative, { passive: false });
    canvas.addEventListener("touchend", onTouchEndNative, { passive: true });

    return () => {
      canvas.removeEventListener("wheel", onWheelNative);
      canvas.removeEventListener("touchstart", onTouchStartNative);
      canvas.removeEventListener("touchmove", onTouchMoveNative);
      canvas.removeEventListener("touchend", onTouchEndNative);
    };
  }, []);

  // Pointer drag pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomScale > 1) {
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSelectOption = (id: string) => {
    playCtaClickSound();
    setSelectedId(id);
    onSelectOption?.(id);
  };

  return (
    <div className="flex flex-col gap-4 w-full select-none text-[#f3e5ab]">
      {/* 2-Column Side-by-Side Grid: Left (Image Viewer + Thumbnails) & Right (MCQ Answers) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* ============================================================ */}
        {/* LEFT COLUMN: HIGH-RESOLUTION IMAGE VIEWER + THUMBNAILS (Col 7) */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {/* Main High-Res Cervical Canvas */}
          <div className="flex flex-col rounded-2xl border-2 border-[#8c6d23]/50 bg-[#160f09]/95 overflow-hidden shadow-2xl relative min-h-[420px] max-h-[480px]">
            {/* Top Floating Zoom Controls Bar */}
            <div className="absolute top-3 right-3 z-30 flex items-center gap-1 rounded-xl bg-black/85 backdrop-blur-md border border-[#8c6d23]/60 p-1 shadow-xl">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleZoomIn}
                disabled={zoomScale >= 3.5}
                className="size-7.5 rounded-lg text-[#f3e5ab] hover:bg-[#d4af37]/20 hover:text-white cursor-pointer"
                title="Perbesar (+)"
              >
                <Plus className="size-3.5" />
              </Button>

              <span className="font-mono text-[11px] font-bold text-[#d4af37] px-1 min-w-[44px] text-center">
                {Math.round(zoomScale * 100)}%
              </span>

              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleZoomOut}
                disabled={zoomScale <= 1}
                className="size-7.5 rounded-lg text-[#f3e5ab] hover:bg-[#d4af37]/20 hover:text-white cursor-pointer"
                title="Perkecil (-)"
              >
                <Minus className="size-3.5" />
              </Button>

              <div className="h-4 w-px bg-[#8c6d23]/40 mx-0.5" />

              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleResetZoom}
                className="size-7.5 rounded-lg text-[#f3e5ab] hover:bg-[#d4af37]/20 hover:text-white cursor-pointer"
                title="Reset Zoom (100%)"
              >
                <RotateCcw className="size-3" />
              </Button>
            </div>

            {/* Interactive Zoom Canvas */}
            <div
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={cn(
                "relative flex-1 w-full overflow-hidden flex items-center justify-center bg-black min-h-[340px]",
                zoomScale > 1
                  ? isDragging
                    ? "cursor-grabbing"
                    : "cursor-grab"
                  : "cursor-default",
              )}
            >
              <img
                src={activeImage.url}
                alt={activeImage.title}
                draggable={false}
                style={{
                  transform: `scale(${zoomScale}) translate(${panPosition.x / zoomScale}px, ${panPosition.y / zoomScale}px)`,
                  transition: isDragging ? "none" : "transform 0.12s ease-out",
                }}
                className="w-full h-full object-contain pointer-events-none select-none max-h-[420px]"
              />

              {/* Bottom Caption Overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 text-white pointer-events-none">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-serif font-bold text-sm text-[#fff8db] drop-shadow truncate">
                      {activeImage.title}
                    </h4>
                    <p className="text-xs text-[#e6d59c]/90 leading-tight mt-0.5 drop-shadow line-clamp-2">
                      {activeImage.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="outline" className="border-[#d4af37]/70 text-[#d4af37] text-[10px] bg-black/70 gap-1">
                      <ZoomIn className="size-2.5" /> Scroll / Pinch
                    </Badge>
                    {zoomScale > 1 && (
                      <Badge variant="outline" className="border-amber-400 text-amber-300 text-[10px] bg-black/70 gap-1">
                        <Hand className="size-2.5" /> Geser Foto
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dedicated Gallery Thumbnails List (Click to Switch & Highlight) */}
          <div className="flex flex-col gap-2 rounded-2xl border border-[#8c6d23]/40 bg-[#1a130d]/90 p-3 shadow-md">
            <div className="flex items-center justify-between border-b border-[#8c6d23]/30 pb-1.5">
              <span className="font-serif font-bold text-xs text-[#fff8db] flex items-center gap-1.5">
                <ImageIcon className="size-3.5 text-[#d4af37]" /> Galeri Foto Pasien (Klik untuk Menampilkan):
              </span>
              <Badge variant="outline" className="text-[10px] border-[#d4af37]/50 text-[#d4af37] bg-[#140e08] px-1.5 py-0">
                {clinicalImages.length} Foto Klinis
              </Badge>
            </div>

            {/* List of Thumbnail Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
              {clinicalImages.map((img) => {
                const isSelected = highlightedImageId === img.id;
                return (
                  <div
                    key={img.id}
                    onClick={() => {
                      playCtaClickSound();
                      setHighlightedImageId(img.id);
                      handleResetZoom();
                    }}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl border p-2 transition-all cursor-pointer group select-none",
                      isSelected
                        ? "border-[#d4af37] bg-gradient-to-r from-[#3b2715] to-[#2a1b0e] ring-2 ring-[#d4af37]/70 shadow-md"
                        : "border-[#8c6d23]/35 bg-[#22160d] hover:border-[#d4af37]/70 hover:bg-[#2c1d11]",
                    )}
                  >
                    <div className="size-12 rounded-lg overflow-hidden border border-[#8c6d23]/40 bg-black shrink-0 relative">
                      <img src={img.url} alt={img.title} className="size-full object-cover group-hover:scale-105 transition-transform" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#d4af37]/25 flex items-center justify-center">
                          <Eye className="size-4 text-[#fff8db] drop-shadow" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={cn(
                            "text-xs font-serif font-bold truncate",
                            isSelected ? "text-[#fff8db]" : "text-[#e6d59c] group-hover:text-[#fff8db]",
                          )}
                        >
                          {img.title}
                        </span>
                        {isSelected && (
                          <Badge className="bg-[#d4af37] text-[#14100c] text-[8px] px-1 py-0 font-bold shrink-0">
                            Aktif
                          </Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-[#d4af37]/70 line-clamp-1 mt-0.5">
                        {img.description}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: CLINICAL INTERPRETATION OPTIONS (Col 5)        */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 flex flex-col gap-3.5 rounded-2xl border-2 border-[#d4af37]/60 bg-[#160f09]/95 p-4 sm:p-5 shadow-xl">
          <div className="border-b border-[#8c6d23]/40 pb-3">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <h3 className="font-serif font-bold text-sm sm:text-base text-[#fff8db] flex items-center gap-2">
                <Sparkles className="size-4 text-[#d4af37]" />
                <span>Pilihan Kesimpulan Diagnosis</span>
              </h3>
              <Badge className="bg-gradient-to-r from-[#8c6d23] to-[#d4af37] text-[#14100c] font-black text-[10px] shadow-xs">
                Pilih 1 Jawaban
              </Badge>
            </div>
            <p className="text-xs text-[#e6d59c]/80 leading-relaxed">
              Berdasarkan temuan inspeksi visual porsio serviks pasca aplikasi asam asetat 3–5% di sebelah kiri, tentukan diagnosis klinis yang paling tepat:
            </p>
          </div>

          {/* 4 MCQ Vertical Stacked Option Cards */}
          <div className="flex flex-col gap-2.5">
            {mcqOptions.map((opt) => {
              const isSelected = selectedId === opt.id;

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border-2 p-3.5 transition-all cursor-pointer shadow-md group relative select-none",
                    isSelected
                      ? "border-[#d4af37] bg-gradient-to-r from-[#3a2717] via-[#2f1f12] to-[#3a2717] ring-2 ring-[#d4af37]/70 shadow-[0_0_18px_rgba(212,175,55,0.3)] scale-[1.01]"
                      : "border-[#8c6d23]/40 bg-[#22160d] hover:border-[#d4af37]/80 hover:bg-[#2d1e12] hover:scale-[1.005]",
                  )}
                >
                  {/* Radio Circle Indicator */}
                  <div
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all mt-0.5 shadow-xs",
                      isSelected
                        ? "border-[#fff8db] bg-[#d4af37] text-[#14100c]"
                        : "border-[#8c6d23]/60 bg-[#19110a] group-hover:border-[#d4af37]",
                    )}
                  >
                    {isSelected && <Check className="size-3.5 stroke-[3]" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-xs sm:text-[13px] font-serif leading-relaxed",
                        isSelected
                          ? "font-bold text-[#fff8db] drop-shadow"
                          : "font-medium text-[#e6d59c] group-hover:text-[#fff8db]",
                      )}
                    >
                      {opt.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Helper Footer Note */}
          <div className="border-t border-[#8c6d23]/30 pt-2.5 flex items-center justify-between text-[10px] text-[#d4af37]/75 font-mono">
            <span>💡 Gunakan zoom pada gambar untuk evaluasi plak</span>
            <span>{selectedId ? "Jawaban Terpilih" : "Belum Memilih"}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
