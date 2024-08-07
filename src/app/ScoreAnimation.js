import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ScoreAnimation = ({ score, isVisible }) => {
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (isVisible) {
      setKey(prevKey => prevKey + 1);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={key}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.5 }}
          className={`font-bold text-4xl ${
            score > 0 ? 'text-green-500' : 'text-orange-500'
          } bg-white bg-opacity-80 p-4 rounded-full`}
        >
          {score > 0 ? '+1' : '-1'}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScoreAnimation;