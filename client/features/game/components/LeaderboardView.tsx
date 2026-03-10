// client/features/game/components/LeaderboardView.tsx
// Leaderboard table UI  (no Firebase cinfig)
"use client";

import Image from 'next/image';
import type { LeaderboardEntry } from '../types';
import { ICONS } from '../constants';

interface LeaderboardViewProps {
    leaderboard: LeaderboardEntry[];
    leaderboardLoading: boolean;
    currentUserUid?: string;
}

export default function LeaderboardView({ leaderboard, leaderboardLoading, currentUserUid }: LeaderboardViewProps) {
    return (
        <div className="leaderboard-container">
            {leaderboardLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="spinner" />
                    <p style={{ marginTop: '12px', opacity: 0.7 }}>Loading leaderboard...</p>
                </div>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Player</th>
                            <th>
                                <Image src={ICONS.heart} alt="Hearts" width={24} height={24} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                Hearts
                            </th>
                            <th>
                                <Image src={ICONS.carrot} alt="Carrots" width={24} height={24} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                Carrots
                            </th>
                            <th>Time</th>
                            <th>Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.length > 0 ? (
                            leaderboard.map((entry, index) => (
                                <tr key={index} className={entry.uid === currentUserUid ? 'current-user-row' : ''}>
                                    <td className="rank">
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                    </td>
                                    <td>{entry.displayName}</td>
                                    <td>{entry.hearts}</td>
                                    <td>{entry.carrots}</td>
                                    <td>
                                        {Math.floor(entry.time / 60).toString().padStart(2, '0')}:
                                        {(entry.time % 60).toString().padStart(2, '0')}
                                    </td>
                                    <td>
                                        <span className={`result-badge ${entry.result === 'win' ? 'badge-win' : 'badge-loss'}`}>
                                            {entry.result === 'win' ? ' Win' : ' Loss'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>No scores yet for this level. Be the first!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}
