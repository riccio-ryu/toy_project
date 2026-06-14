"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface Props {
  onClick: () => void;
}

export default function TarotConfirmButton({ onClick }: Props) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
      className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2"
    >
      선택 완료 <ArrowRight className="w-4 h-4" />
    </motion.button>
  );
}
