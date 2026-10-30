import { useCinemaStore } from "#/store/cinema";
import { MovieGrid } from "#/components/panels/MovieGrid";
import { MovieDetailCard } from "#/components/checkout/MovieDetailCard";
import { ShowtimePicker } from "#/components/checkout/ShowtimePicker";
import { PanelCheckout } from "#/components/panels/PanelCheckout";
import { ConcessionsPicker } from "#/components/checkout/ConcessionsPicker";
import { TicketSelector } from "#/components/checkout/TicketSelector";
import { PanelSeatPicker } from "#/components/panels/PanelSeatPicker";
import { PaymentCard } from "#/components/checkout/PaymentCard";
import { SuccessPlaceholder } from "#/components/checkout/SuccessPlaceholder";
import { Card } from "#/components/ui/card";
import { AnimatePresence, motion } from "motion/react";

function CardShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={`w-full h-full rounded-[32px] ${className || ""}`}>
      {children}
    </Card>
  );
}

const panelVariants = {
  hidden: { opacity: 0, scale: 0.97, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const } },
  exit: { opacity: 0, scale: 0.97, y: -8, transition: { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export function LeftPanel() {
  const checkoutStep = useCinemaStore((s) => s.checkoutStep);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {checkoutStep === "movie-info" && (
          <motion.div key="movie-info" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="w-full h-full">
            <CardShell>
              <MovieDetailCard />
            </CardShell>
          </motion.div>
        )}

        {checkoutStep === "showtime-select" && (
          <motion.div key="showtime-select" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="w-full h-full">
            <CardShell>
              <ShowtimePicker />
            </CardShell>
          </motion.div>
        )}

        {(checkoutStep === "ticket-select" || checkoutStep === "seat-select" || checkoutStep === "concessions" || checkoutStep === "payment" || checkoutStep === "success") && (
          <motion.div key="checkout" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="w-full h-full">
            <PanelCheckout />
          </motion.div>
        )}

        {checkoutStep === "idle" && (
          <motion.div key="movie-grid" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="w-full h-full">
            <MovieGrid />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function RightPanel() {
  const checkoutStep = useCinemaStore((s) => s.checkoutStep);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {checkoutStep === "idle" && (
          <motion.div key="right-idle" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="w-full h-full" />
        )}

        {checkoutStep === "movie-info" && (
          <motion.div key="right-showtimes" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="w-full h-full">
            <CardShell>
              <ShowtimePicker />
            </CardShell>
          </motion.div>
        )}

        {checkoutStep === "showtime-select" && (
          <motion.div key="right-tickets" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="w-full h-full">
            <CardShell>
              <TicketSelector />
            </CardShell>
          </motion.div>
        )}

        {checkoutStep === "ticket-select" && (
          <motion.div key="right-ticket-select" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="w-full h-full">
            <CardShell>
              <TicketSelector />
            </CardShell>
          </motion.div>
        )}

        {checkoutStep === "seat-select" && (
          <motion.div key="right-seats" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="w-full h-full">
            <PanelSeatPicker />
          </motion.div>
        )}

        {checkoutStep === "concessions" && (
          <motion.div key="right-concessions" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="w-full h-full">
            <CardShell>
              <ConcessionsPicker />
            </CardShell>
          </motion.div>
        )}

        {checkoutStep === "payment" && (
          <motion.div key="right-payment" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="w-full h-full">
            <CardShell>
              <PaymentCard />
            </CardShell>
          </motion.div>
        )}

        {checkoutStep === "success" && (
          <motion.div key="right-success" variants={panelVariants} initial="hidden" animate="visible" exit="exit" className="w-full h-full">
            <CardShell>
              <SuccessPlaceholder />
            </CardShell>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
