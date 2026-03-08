// client/features/game/components/SidePanel.tsx
// Side panel showing collected items (Presentational component)
"use client";

import { ICONS } from '../constants';

interface SidePanelProps {
    foundHearts: number;
    foundCarrots: number;
}

export default function SidePanel({ foundHearts, foundCarrots }: SidePanelProps) {
    return (
        <div className="side-panel">
            <div>
                <div className="side-label">Collected</div>
                <div className="side-score heart">
                    <img src={ICONS.heart} alt="Heart" style={{ width: '1.6em', marginRight: '8px' }} />
                    <span>{foundHearts}</span>
                </div>
            </div>
            <div>
                <div className="side-label">Collected</div>
                <div className="side-score carrot">
                    <img src={ICONS.carrot} alt="Carrot" style={{ width: '1.6em', marginRight: '8px' }} />
                    <span>{foundCarrots}</span>
                </div>
            </div>
            <div style={{ marginTop: 'auto', fontSize: '0.7rem', opacity: 0.5, textAlign: 'center' }}>
                {/* Optional footer text */}
            </div>
        </div>
    );
}
