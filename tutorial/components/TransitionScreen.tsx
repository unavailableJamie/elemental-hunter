import React, { useEffect, useState } from 'react';

interface TransitionScreenProps {
  onComplete: () => void;
}

export const TransitionScreen: React.FC<TransitionScreenProps> = ({ onComplete }) => {
  const [opacity, setOpacity] = useState(0);
  const [text, setText] = useState('Ván 1 hoàn thành. Chuẩn bị Ván 2...');
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Fade in (0 → 1)
    const t1 = setTimeout(() => setOpacity(1), 50);

    // Change text mid-transition
    const t2 = setTimeout(() => setText('Ván 2: Nâng cao'), 1800);

    // Fade out (1 → 0)
    const t3 = setTimeout(() => setFadeOut(true), 2300);

    // Call onComplete after fade out
    const t4 = setTimeout(() => onComplete(), 2800);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
      style={{
        opacity: fadeOut ? 0 : opacity,
        transition: fadeOut ? 'opacity 0.5s ease' : 'opacity 0.5s ease',
        pointerEvents: 'all',
      }}
    >
      <div className="text-center">
        <div className="text-5xl mb-4">⚡</div>
        <p className="text-white text-xl font-bold tracking-wide">{text}</p>
        <div className="mt-6 flex justify-center gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
