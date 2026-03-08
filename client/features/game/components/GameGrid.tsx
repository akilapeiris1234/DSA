// client/features/game/components/GameGrid.tsx
// Game tile grid (Presentational — receives board + handler as props)
"use client";

import type { Cell } from '../types';
import { ICONS } from '../constants';

interface GameGridProps {
    board: Cell[][];
    gridSize: number;
    tileSize: number;
    onReveal: (r: number, c: number) => void;
}

export default function GameGrid({ board, gridSize, tileSize, onReveal }: GameGridProps) {
    return (
        <div className="grid-container">
            <div id="grid" className="grid" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
                {board.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center' }}>
                        Preparing game...
                    </div>
                ) : (
                    board.map((row, ri) =>
                        row.map((cell, ci) => {
                            const revealed = cell.revealed;
                            let content: string | React.ReactElement = '';

                            if (revealed) {
                                if (cell.content === 'heart') {
                                    content = <img src={ICONS.heart} alt="Heart" style={{ width: '85%', height: '85%' }} />;
                                } else if (cell.content === 'carrot') {
                                    content = <img src={ICONS.carrot} alt="Carrot" style={{ width: '85%', height: '85%' }} />;
                                } else if (cell.content === 'bomb') {
                                    content = <img src={ICONS.bomb} alt="Bomb" style={{ width: '85%', height: '85%' }} />;
                                } else if (cell.neighborBombs > 0) {
                                    content = <span className={`hint h${cell.neighborBombs}`}>{cell.neighborBombs}</span>;
                                }
                            }

                            return (
                                <div
                                    key={`${ri}-${ci}`}
                                    className={`tile ${revealed ? 'revealed' : ''} ${revealed && cell.content === 'bomb' ? 'bomb' : ''}`}
                                    style={{ width: tileSize, height: tileSize }}
                                    onClick={() => onReveal(ri, ci)}
                                >
                                    {content}
                                </div>
                            );
                        })
                    )
                )}
            </div>
        </div>
    );
}
