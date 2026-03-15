// client/features/game/components/SidePanel.tsx
// Side panel showing collected items (Presentational component)
"use client";

import Image from 'next/image';
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
                    <Image src={ICONS.heart} alt="Heart" width={26} height={26} style={{ width: '1.6em', marginRight: '8px' }} />
                    <span>{foundHearts}</span>
                </div>
            </div>
            <div>
                <div className="side-label">Collected</div>
                <div className="side-score carrot">
                    <Image src={ICONS.carrot} alt="Carrot" width={26} height={26} style={{ width: '1.6em', marginRight: '8px' }} />
                    <span>{foundCarrots}</span>
                </div>
            </div>
        </div>
    );
}
