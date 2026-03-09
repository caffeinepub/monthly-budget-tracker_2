import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

interface MonthNavigatorProps {
  monthLabel: string;
  onPrev: () => void;
  onNext: () => void;
}

export function MonthNavigator({
  monthLabel,
  onPrev,
  onNext,
}: MonthNavigatorProps) {
  return (
    <div className="flex items-center justify-between bg-card border border-border rounded-xl px-5 py-4 shadow-card">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrev}
        data-ocid="month.pagination_prev"
        className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        aria-label="Previous month"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <motion.div
        key={monthLabel}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2"
      >
        <CalendarDays className="h-4 w-4 text-primary" />
        <span className="font-display text-xl font-bold text-foreground tracking-tight">
          {monthLabel}
        </span>
      </motion.div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        data-ocid="month.pagination_next"
        className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        aria-label="Next month"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
