/**
 * People Management Page
 *
 * PM coaching, 1:1 tracking, and IDP management for M2P
 */

"use client";

import { useState } from "react";
import type { PMProfile } from "@/lib/control-tower/people-types";

// Mock PM profiles - will be replaced with actual data
const mockPMProfiles: PMProfile[] = [
  {
    id: "pm-1",
    name: "PM Name 1",
    email: "pm1@m2p.com",
    role: "SPM",
    productCharters: ["Co-Lending", "LAS"],
    startDate: "2024-01-15",
    lastOneOnOneDate: "2026-02-15"
  },
  {
    id: "pm-2",
    name: "PM Name 2",
    email: "pm2@m2p.com",
    role: "APM",
    productCharters: ["BNPL"],
    startDate: "2024-06-01",
    lastOneOnOneDate: "2026-02-20"
  }
];

export default function PeoplePage() {
  const [pmProfiles] = useState<PMProfile[]>(mockPMProfiles);

  const getDaysSinceLastOneOnOne = (lastDate?: string): number => {
    if (!lastDate) return 999;
    return Math.floor(
      (new Date().getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const isOverdue = (lastDate?: string): boolean => {
    return getDaysSinceLastOneOnOne(lastDate) > 30;
  };

  return (
    <div className="min-h-screen bg-warm-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-warm-900 mb-2">People Management</h1>
          <p className="text-warm-600">PM coaching, 1:1s, and IDP tracking</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total PMs</div>
            <div className="text-3xl font-bold text-gray-900">{pmProfiles.length}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-yellow-600 mb-1">1:1s Overdue</div>
            <div className="text-3xl font-bold text-yellow-700">
              {pmProfiles.filter((pm) => isOverdue(pm.lastOneOnOneDate)).length}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-green-600 mb-1">Up to Date</div>
            <div className="text-3xl font-bold text-green-700">
              {pmProfiles.filter((pm) => !isOverdue(pm.lastOneOnOneDate)).length}
            </div>
          </div>
        </div>

        {/* PM List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Product Managers</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {pmProfiles.map((pm) => {
              const daysSince = getDaysSinceLastOneOnOne(pm.lastOneOnOneDate);
              const overdueFlag = isOverdue(pm.lastOneOnOneDate);

              return (
                <div key={pm.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{pm.name}</h3>
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                          {pm.role}
                        </span>
                        {overdueFlag && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                            1:1 Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{pm.email}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>
                          <strong>Charters:</strong> {pm.productCharters.join(", ")}
                        </span>
                        <span>
                          <strong>Last 1:1:</strong>{" "}
                          {pm.lastOneOnOneDate
                            ? `${daysSince} days ago`
                            : "Never"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                        1:1 Prep
                      </button>
                      <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium">
                        Draft IDP
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
