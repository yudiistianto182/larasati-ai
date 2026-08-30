import * as React from "react";
import {
  Check,
  CheckCircle2,
  Expand,
  Eye,
  Hand,
  ImageIcon,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface McqOption {
  id: string;
  label: string;
  category: string;
  isCorrect?: boolean;
}

const MCQ_OPTIONS: McqOption[] = [
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
    label: "C. IVA Positif (Ditemukan plak tebal warna putih pekat / Acetowhite tebal pada SSK)",
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

const CLINICAL_IMAGES: ClinicalImage[] = [
  {
    id: "img-1",
    title: "1. Foto Inspeksi Serviks Pasca Aplikasi Asam Asetat 3-5%",
    description: "Tampak jelas plak putih pekat (Acetowhite epithelium) tebal dengan batas tegas menyentuh garis SSK porsio jam 11 - 02.",
    url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80",
    isPrimary: true,
  },
  {
    id: "img-2",
    title: "2. Serviks Normal (Pembanding Fisiologis)",
    description: "Epitel skuamosa porsio berwarna merah muda homogen, SSK terlihat melingkar rata tanpa lesi asetowhite.",
    url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "img-3",
    title: "3. Servisitis Kronis / Ektopi (Pembanding Benigna)",
    description: "Zona erosi porsio merah bergranula dengan vaskularisasi fisiologis, reaksi asam asetat negatif samar.",
    url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "img-4",
    title: "4. Plak Asetowhite Tipis (Pembanding)",
    description: "Reaksi asetowhite transparan tipis yang cepat menghilang dalam waktu kurang dari 30 detik.",
    url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80",
  },
];

interface Step5InterpretasiMcqProps {
  selectedOptionId?: string;
  onSelectOption?: (optionId: string) => void;
}

export function Step5InterpretasiMcq({
  selectedOptionId: initialOptionId = "opt-c",
  onSelectOption,
}: Step5InterpretasiMcqProps) {
  const [selectedId, setSelectedId] = React.useState<string>(initialOptionId);
  const [highlightedImageId, setHighlightedImageId] = React.useState<string>("img-1");
  const [zoomScale, setZoomScale] = React.useState<number>(1);
  const [panPosition, setPanPosition] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = React.useRef<HTMLDivElement>(null);
  const zoomScaleRef = React.useRef(zoomScale);
  zoomScaleRef.current = zoomScale;

  const activeImage = CLINICAL_IMAGES.find((img) => img.id === highlightedImageId) || CLINICAL_IMAGES[0];

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

  // Native Non-Passive Event Listeners for Wheel & Touch Pinch (Fixes Unable to preventDefault warning)
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
    setSelectedId(id);
    onSelectOption?.(id);
  };

  return (
    <div className="flex flex-col gap-5 w-full select-none text-[#f3e5ab]">
      {/* 1. Upper Section: Side-by-Side Highlighted Zoom Canvas & Side Thumbnail Gallery List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left 9 Cols: Main High-Resolution Cervix Viewer with Wheel/Pinch Zoom */}
        <div className="lg:col-span-9 flex flex-col rounded-2xl border-2 border-[#8c6d23]/50 bg-[#160f09]/90 overflow-hidden shadow-2xl relative min-h-[420px] max-h-[480px]">
          {/* Top Floating Zoom Controls Bar */}
          <div className="absolute top-3 right-3 z-30 flex items-center gap-1 rounded-xl bg-black/80 backdrop-blur-md border border-[#8c6d23]/60 p-1 shadow-lg">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={handleZoomIn}
              disabled={zoomScale >= 3.5}
              className="size-7 rounded-lg text-[#f3e5ab] hover:bg-[#d4af37]/20 hover:text-white"
              title="Perbesar (+)"
            >
              <Plus className="size-3.5" />
            </Button>

            <span className="font-mono text-[11px] font-bold text-[#d4af37] px-1 min-w-[42px] text-center">
              {Math.round(zoomScale * 100)}%
            </span>

            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={handleZoomOut}
              disabled={zoomScale <= 1}
              className="size-7 rounded-lg text-[#f3e5ab] hover:bg-[#d4af37]/20 hover:text-white"
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
              className="size-7 rounded-lg text-[#f3e5ab] hover:bg-[#d4af37]/20 hover:text-white"
              title="Reset Zoom (100%)"
            >
              <RotateCcw className="size-3" />
            </Button>
          </div>

          {/* Interactive Zoom Canvas with Native Non-Passive Handlers */}
          <div
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={cn(
              "relative flex-1 w-full overflow-hidden flex items-center justify-center bg-black min-h-[300px]",
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
              className="w-full h-full object-contain pointer-events-none select-none max-h-[400px]"
            />

            {/* Bottom Caption Overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3.5 text-white pointer-events-none">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#fff8db] drop-shadow">
                    {activeImage.title}
                  </h4>
                  <p className="text-xs text-[#e6d59c]/90 leading-tight mt-0.5 drop-shadow">
                    {activeImage.description}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant="outline" className="border-[#d4af37]/70 text-[#d4af37] text-[10px] bg-black/60 gap-1">
                    <ZoomIn className="size-2.5" /> Scroll/Pinch Zoom
                  </Badge>
                  {zoomScale > 1 && (
                    <Badge variant="outline" className="border-amber-400 text-amber-300 text-[10px] bg-black/60 gap-1">
                      <Hand className="size-2.5" /> Drag Pan
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 3 Cols: Side Thumbnail Gallery List */}
        <div className="lg:col-span-3 flex flex-col rounded-2xl border border-[#8c6d23]/40 bg-[#1a130d]/90 overflow-hidden shadow-lg p-3 max-h-[480px]">
          <div className="flex items-center justify-between border-b border-[#8c6d23]/30 pb-2 mb-2">
            <span className="font-serif font-bold text-xs text-[#fff8db] flex items-center gap-1.5">
              <ImageIcon className="size-3.5 text-[#d4af37]" /> Foto Klinis (3+1)
            </span>
            <Badge variant="outline" className="text-[10px] border-[#d4af37]/40 text-[#d4af37] bg-[#140e08]">
              {CLINICAL_IMAGES.length} Foto
            </Badge>
          </div>

          {/* Vertically Scrollable Thumbnails List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-[#8c6d23]/50">
            {CLINICAL_IMAGES.map((img) => {
              const isSelected = highlightedImageId === img.id;

              return (
                <div
                  key={img.id}
                  onClick={() => {
                    setHighlightedImageId(img.id);
                    handleResetZoom();
                  }}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border p-2 transition-all cursor-pointer group shrink-0",
                    isSelected
                      ? "border-[#d4af37] bg-gradient-to-r from-[#8c6d23]/40 to-[#d4af37]/20 ring-2 ring-[#d4af37]/60 shadow-md"
                      : "border-[#8c6d23]/30 bg-[#251b11] hover:border-[#d4af37]/70 hover:bg-[#322315]",
                  )}
                >
                  <div className="size-14 rounded-lg overflow-hidden border border-[#8c6d23]/40 bg-black shrink-0 relative">
                    <img
                      src={img.url}
                      alt={img.title}
                      className="size-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#d4af37]/20 flex items-center justify-center">
                        <Eye className="size-4 text-[#fff8db] drop-shadow" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <span
                      className={cn(
                        "text-xs font-serif font-bold leading-tight truncate",
                        isSelected ? "text-[#fff8db]" : "text-[#e6d59c] group-hover:text-[#fff8db]",
                      )}
                    >
                      {img.title}
                    </span>
                    <span className="text-[10px] text-[#d4af37]/70 line-clamp-2 mt-0.5 leading-snug">
                      {img.description}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Lower Section: Clinical Interpretation Question & Multiple-Choice Options */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#8c6d23]/40 bg-[#1a130d]/90 p-4 sm:p-5 shadow-lg">
        <div>
          <h3 className="font-serif font-bold text-sm sm:text-base text-[#fff8db] flex items-center gap-2">
            <span>Pilihan Diagnosis Kesimpulan Klinis Pemeriksaan IVA</span>
            <Badge className="bg-[#d4af37] text-[#14100c] font-bold text-[10px] shadow-xs">
              Pilih 1 Jawaban Terbaik
            </Badge>
          </h3>
          <p className="text-xs text-[#d4af37]/80 mt-0.5">
            Berdasarkan temuan inspeksi visual porsio serviks pasca aplikasi asam asetat 3-5%, tentukan diagnosis klinis yang paling tepat:
          </p>
        </div>

        {/* 4 MCQ Radio Cards */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 pt-1">
          {MCQ_OPTIONS.map((opt) => {
            const isSelected = selectedId === opt.id;

            return (
              <div
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border-2 p-3.5 transition-all cursor-pointer shadow-md group relative",
                  isSelected
                    ? "border-[#d4af37] bg-gradient-to-r from-[#8c6d23]/40 via-[#d4af37]/25 to-[#8c6d23]/30 ring-2 ring-[#d4af37]/60 shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                    : "border-[#8c6d23]/40 bg-[#251b11] hover:border-[#d4af37]/70 hover:bg-[#322315]",
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

                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Badge
                      className={cn(
                        "text-[9px] font-bold shadow-xs",
                        isSelected
                          ? "bg-[#140e08] text-[#f9f586] border border-[#d4af37]"
                          : "bg-[#1a120b] text-[#d4af37] border border-[#8c6d23]/40",
                      )}
                    >
                      {opt.category}
                    </Badge>
                    {isSelected && (
                      <span className="text-[10px] text-[#f9f586] font-bold flex items-center gap-1">
                        <CheckCircle2 className="size-3 text-[#d4af37]" /> Terpilih
                      </span>
                    )}
                  </div>

                  <p
                    className={cn(
                      "text-xs sm:text-sm font-serif leading-relaxed",
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
      </div>
    </div>
  );
}
