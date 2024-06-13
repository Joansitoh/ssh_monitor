import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

const Popup = ({ isOpen, onClose, closeOnOutsideClick = true, children }) => {
  const ref = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        ref.current &&
        !ref.current.contains(event.target) &&
        closeOnOutsideClick
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, closeOnOutsideClick]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed z-40 inset-0 overflow-y-auto transition-opacity duration-500">
      <div className="absolute -z-40 h-screen w-full bg-gray-500 bg-opacity-50"></div>
      <div className="min-h-screen flex flex-col justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1 }}
          ref={ref}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default Popup;
