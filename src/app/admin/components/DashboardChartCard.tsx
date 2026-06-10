"use client";

import React from "react";

interface DashboardChartCardProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}

export default function DashboardChartCard({ title, subtitle, children }: DashboardChartCardProps) {
    return (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm
        p-6 flex flex-col min-w-[300px] flex-1">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
                {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>

            {/* Esto renderiza el gráfico */}
            <div className="relative h-64 w-full flex items-center justify-center">
                {children}
            </div>
        </div>
    );
}