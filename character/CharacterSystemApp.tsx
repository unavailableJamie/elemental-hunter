import React, { useState } from 'react';
import { CharacterListScene } from './scenes/CharacterListScene.tsx';
import { CharacterInfoScene } from './scenes/CharacterInfoScene.tsx';

type Scene =
  | { id: 'character-list' }
  | { id: 'character-info'; charId: string };

interface CharacterSystemAppProps {
  onExit: () => void;
  activeCharId: string;
  onSetActiveChar: (id: string) => void;
}

export const CharacterSystemApp: React.FC<CharacterSystemAppProps> = ({ onExit, activeCharId, onSetActiveChar }) => {
  const [scene, setScene] = useState<Scene>({ id: 'character-list' });

  return (
    <div style={{
      position: 'fixed', inset: 0,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      {scene.id === 'character-list' && (
        <CharacterListScene
          onBack={onExit}
          onSelectChar={(charId) => setScene({ id: 'character-info', charId })}
          activeCharId={activeCharId}
        />
      )}
      {scene.id === 'character-info' && (
        <CharacterInfoScene
          charId={scene.charId}
          onBack={() => setScene({ id: 'character-list' })}
          activeCharId={activeCharId}
          onSetActiveChar={onSetActiveChar}
        />
      )}
    </div>
  );
};
