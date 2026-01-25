/**
 * @fileoverview Componente logo per desktop.
 *
 * Versione estesa del logo TaskTrack, utilizzata nella sidebar desktop.
 *
 * @module components/logo/logoDesktop
 */

import React from 'react';
import { LogoBars } from './logoMobile';

/**
 * Logo TaskTrack per desktop.
 *
 * Visibile solo su schermi lg e superiori.
 * Posizionato nell'header della sidebar.
 */
export default function LogoDesktop(): React.ReactElement {
    return (
        <div className="hidden lg:flex items-center gap-3 px-6 h-16 border-b border-gray-100">
            <LogoBars size="medium" />
            <span className="text-xl font-bold text-slate-900 tracking-tight">
                TaskTrack
            </span>
        </div>
    );
}