import React from 'react';

// Reusable Pulse Skeleton Base
export const SkeletonPulse = ({ className = "" }) => (
  <div className={`animate-pulse bg-slate-200/80 rounded ${className}`} />
);

// Skeleton for Stat Cards Grid (Dashboards, Reports)
export const SkeletonStatCards = ({ count = 5 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 w-full">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between h-28">
        <div className="flex justify-between items-start">
          <SkeletonPulse className="h-3 w-20" />
          <SkeletonPulse className="h-4 w-4 rounded-full" />
        </div>
        <SkeletonPulse className="h-8 w-14 mt-3" />
      </div>
    ))}
  </div>
);

// Skeleton for Ticket List Table Rows
export const SkeletonTableRows = ({ count = 5 }) => (
  <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs w-full">
    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
      <SkeletonPulse className="h-4 w-32" />
      <SkeletonPulse className="h-8 w-48 rounded-lg" />
    </div>
    <div className="divide-y divide-slate-100">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center gap-2">
              <SkeletonPulse className="h-5 w-28 rounded-md" />
              <SkeletonPulse className="h-4 w-16 rounded-full" />
              <SkeletonPulse className="h-4 w-20 rounded-full" />
            </div>
            <SkeletonPulse className="h-4 w-3/4" />
            <SkeletonPulse className="h-3 w-1/3" />
          </div>
          <SkeletonPulse className="h-8 w-24 rounded-md shrink-0" />
        </div>
      ))}
    </div>
  </div>
);

// Skeleton for Activity Audit Feed
export const SkeletonTimelineFeed = ({ count = 4 }) => (
  <div className="flex flex-col gap-6 w-full max-w-4xl pt-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <div className="flex flex-col items-center">
          <SkeletonPulse className="w-3 h-3 rounded-full shrink-0" />
          <SkeletonPulse className="w-0.5 flex-1 my-1" />
        </div>
        <div className="flex-1 pb-5 border-b border-slate-100 flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <SkeletonPulse className="h-4 w-28" />
              <SkeletonPulse className="h-4 w-20 rounded-full" />
            </div>
            <SkeletonPulse className="h-3 w-24 font-mono" />
          </div>
          <SkeletonPulse className="h-4 w-2/3" />
          <SkeletonPulse className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

// Skeleton for Ticket Detail View
export const SkeletonTicketDetail = () => (
  <div className="flex flex-col gap-6 text-left w-full max-w-6xl mx-auto">
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-2">
        <SkeletonPulse className="h-4 w-24" />
        <SkeletonPulse className="h-7 w-64" />
      </div>
      <SkeletonPulse className="h-6 w-24 rounded-full" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column Skeleton */}
      <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs flex flex-col gap-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <SkeletonPulse className="h-4 w-32" />
          <SkeletonPulse className="h-6 w-20 rounded-full" />
        </div>
        <div className="flex flex-col gap-2">
          <SkeletonPulse className="h-4 w-full" />
          <SkeletonPulse className="h-4 w-5/6" />
          <SkeletonPulse className="h-4 w-4/6" />
        </div>
        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
          <SkeletonPulse className="h-4 w-36" />
          <SkeletonPulse className="h-10 w-44 rounded-md" />
        </div>
      </div>

      {/* Right Column Timeline Skeleton */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs flex flex-col gap-4">
        <SkeletonPulse className="h-5 w-40 pb-2 border-b border-slate-100" />
        <SkeletonTimelineFeed count={3} />
      </div>
    </div>
  </div>
);

// Skeleton for Task Backlog Cards (Programmer View)
export const SkeletonTaskCards = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between gap-4">
        <div className="flex justify-between items-start">
          <SkeletonPulse className="h-5 w-32 rounded-md" />
          <SkeletonPulse className="h-5 w-20 rounded-full" />
        </div>
        <SkeletonPulse className="h-4 w-full" />
        <SkeletonPulse className="h-4 w-4/5" />
        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
          <SkeletonPulse className="h-3 w-24" />
          <SkeletonPulse className="h-7 w-24 rounded-md" />
        </div>
      </div>
    ))}
  </div>
);
