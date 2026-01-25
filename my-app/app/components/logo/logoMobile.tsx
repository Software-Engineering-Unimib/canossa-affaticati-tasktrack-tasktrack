/**
 * @fileoverview Componente logo per dispositivi mobile.
 *
 * Versione compatta del logo TaskTrack, utilizzata nell'header mobile.
 *
 * @module components/logo/logoMobile
 */

import React from 'react';

/**
 * Logo TaskTrack per mobile.
 *
 * Struttura:
 * - Tre barre colorate verticali (brand identity)
 * - Nome dell'app
 */
export default function LogoMobile(): React.ReactElement {
    return (
        <div className="flex items-center gap-2">
            <LogoBars size="small" />
            <span className="font-bold text-lg text-slate-800">TaskTrack</span>
        </div>
    );
}

/**
 * Barre colorate del logo.
 */
function LogoBars({ size }: { size: 'small' | 'medium' | 'large' }): React.ReactElement {
    const sizeClasses = {
        small: { container: 'h-5', bar: 'w-1.5' },
        medium: { container: 'h-6', bar: 'w-2' },
        large: { container: 'h-8', bar: 'w-2' },
    };

    const { container, bar } = sizeClasses[size];

    return (
        <div className={`flex gap-1 ${container}`}>
            <div className={`${bar} bg-blue-500 rounded-sm`} />
            <div className={`${bar} bg-green-500 rounded-sm`} />
            <div className={`${bar} bg-orange-400 rounded-sm`} />
        </div>
    );
}

export { LogoBars };