"use client";

import { motion, AnimatePresence } from "framer-motion";

export function BottomSheet({ open, onClose, children }: any) {
  return (
    <AnimatePresence>
      {open && (
        <div>
          {/* background mask */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 z-50 shadow-xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
