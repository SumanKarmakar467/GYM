import { motion, useReducedMotion } from "framer-motion";

const Reveal = ({ children, delay = 0, direction = "up" }) => {
  const prefersReducedMotion = useReducedMotion();
  const x = direction === "left" ? -40 : direction === "right" ? 40 : 0;
  const y = direction === "up" ? 40 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.7,
        ease: [0.16, 1, 0.3, 1],
        delay: prefersReducedMotion ? 0 : delay / 1000
      }}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
