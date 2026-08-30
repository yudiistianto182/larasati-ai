import * as React from "react";
import { format, subDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  value?: DateRange;
  date?: DateRange;
  onChange?: (value: DateRange | undefined) => void;
  onDateChange?: (value: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
  align?: "start" | "center" | "end";
}

export function DateRangePicker({
  value,
  date,
  onChange,
  onDateChange,
  placeholder = "Pilih rentang tanggal...",
  className,
  align = "start",
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [internalDateRange, setInternalDateRange] = React.useState<DateRange | undefined>(undefined);

  const activeRange = date ?? value ?? internalDateRange;
  let dateRangeLabel = placeholder;

  if (activeRange?.from && activeRange?.to) {
    dateRangeLabel = `${format(activeRange.from, "d MMM yyyy")} - ${format(activeRange.to, "d MMM yyyy")}`;
  } else if (activeRange?.from) {
    dateRangeLabel = format(activeRange.from, "d MMM yyyy");
  }

  const handleDateChange = (nextValue: DateRange | undefined) => {
    if (date === undefined && value === undefined) {
      setInternalDateRange(nextValue);
    }
    onChange?.(nextValue);
    onDateChange?.(nextValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            id="date"
            className={cn(
              "w-full h-8 justify-start text-left font-normal text-xs bg-background transition-colors",
              !activeRange?.from && "text-muted-foreground",
              className,
            )}
          >
            <CalendarIcon className="size-3.5 text-muted-foreground mr-1.5 shrink-0" />
            <span className="truncate">{dateRangeLabel}</span>
          </Button>
        }
      />
      <PopoverContent className="w-auto overflow-hidden p-0 shadow-xl border-border/80" align={align}>
        <Calendar
          mode="range"
          defaultMonth={activeRange?.from || new Date()}
          selected={activeRange}
          onSelect={handleDateChange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
