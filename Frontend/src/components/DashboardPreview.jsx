import React from 'react';
import { ChevronDown, Search, Bell, Plus, MoreVertical, CheckCircle2, ChevronRight, Share } from 'lucide-react';
import { Button } from './ui/button';

export default function DashboardPreview() {
  return (
    <div
      className="rounded-2xl overflow-hidden p-3 md:p-4 text-[11px] select-none pointer-events-none w-full"
      style={{
        background: 'rgba(255, 255, 255, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: 'var(--shadow-dashboard)',
      }}
    >
      <div className="bg-background rounded-xl overflow-hidden shadow-sm flex flex-col h-[480px]">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="MediChain Logo" className="h-7 md:h-8 w-auto object-contain" />
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>
            
            <div className="hidden md:flex ml-4 relative">
              <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search records..." 
                className="pl-8 pr-8 py-1.5 rounded-md border border-border bg-secondary/50 focus:outline-none w-64 text-xs" 
                readOnly
              />
              <div className="absolute right-2 top-1.5 text-[10px] text-muted-foreground font-medium border border-border rounded px-1.5 bg-background">
                ⌘K
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="h-7 text-[11px] font-medium gap-1.5 px-3 rounded-full">
              <Share className="h-3 w-3" />
              Grant Access
            </Button>
            <Bell className="h-4 w-4 text-muted-foreground" />
            <div className="h-7 w-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-medium">
              PT
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-40 border-r border-border p-3 flex flex-col gap-1 overflow-y-auto">
            <div className="px-2 py-1.5 rounded-md bg-secondary text-foreground font-medium flex items-center justify-between">
              Home
            </div>
            <div className="px-2 py-1.5 rounded-md text-muted-foreground flex items-center justify-between">
              Requests
              <span className="bg-primary text-primary-foreground text-[9px] px-1.5 rounded-full">2</span>
            </div>
            <div className="px-2 py-1.5 rounded-md text-muted-foreground">Access Logs</div>
            <div className="px-2 py-1.5 rounded-md text-muted-foreground flex items-center justify-between">
              Prescriptions
              <ChevronRight className="h-3 w-3" />
            </div>
            <div className="px-2 py-1.5 rounded-md text-muted-foreground">Lab Reports</div>
            <div className="px-2 py-1.5 rounded-md text-muted-foreground">Scans</div>
            <div className="px-2 py-1.5 rounded-md text-muted-foreground flex items-center justify-between">
              Insurance
              <ChevronRight className="h-3 w-3" />
            </div>

            <div className="mt-4 mb-1 px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Settings
            </div>
            <div className="px-2 py-1.5 rounded-md text-muted-foreground">Profile</div>
            <div className="px-2 py-1.5 rounded-md text-muted-foreground">Trusted Doctors</div>
            <div className="px-2 py-1.5 rounded-md text-muted-foreground">Security</div>
            <div className="px-2 py-1.5 rounded-md text-muted-foreground">Preferences</div>
          </div>

          {/* Main content */}
          <div className="flex-1 bg-secondary/30 p-5 overflow-y-auto flex flex-col gap-5">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Welcome, Sarah</h2>
            </div>

            {/* Action buttons row */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="px-3 py-1.5 bg-accent text-accent-foreground rounded-full text-[10px] font-medium inline-flex items-center gap-1">
                <Plus className="h-3 w-3" /> Upload Record
              </div>
              <div className="px-3 py-1.5 bg-background border border-border text-foreground rounded-full text-[10px] font-medium">
                Grant Access
              </div>
              <div className="px-3 py-1.5 bg-background border border-border text-foreground rounded-full text-[10px] font-medium">
                Revoke Access
              </div>
              <div className="px-3 py-1.5 bg-background border border-border text-foreground rounded-full text-[10px] font-medium">
                View Scans
              </div>
              <div className="px-3 py-1.5 bg-background border border-border text-foreground rounded-full text-[10px] font-medium">
                Claim Insurance
              </div>
              <div className="px-3 py-1.5 bg-background border border-border text-foreground rounded-full text-[10px] font-medium">
                Download PDF
              </div>
              <div className="px-3 py-1.5 text-muted-foreground text-[10px] font-medium underline underline-offset-2 ml-auto">
                Customize
              </div>
            </div>

            {/* Two equal-width cards */}
            <div className="flex gap-4">
              {/* Active Permissions Card */}
              <div className="flex-1 basis-0 bg-background border border-border rounded-xl p-4 flex flex-col">
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Active Permissions
                </div>
                <div className="text-3xl font-bold font-display tracking-tight text-foreground mb-4">
                  3 Doctors
                </div>
                
                <div className="flex items-center justify-between text-[10px] mb-2">
                  <span className="text-muted-foreground">Last 30 Days</span>
                  <div className="flex gap-2">
                    <span className="text-green-600 font-medium">2 Records Minted</span>
                    <span className="text-red-500 font-medium">1 Access Revoked</span>
                  </div>
                </div>

                {/* SVG Area Chart */}
                <div className="h-20 w-full mt-auto relative">
                  <svg viewBox="0 0 200 80" className="w-full h-full overflow-visible preserve-aspect-ratio-none">
                    <defs>
                      <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,80 L0,50 C30,40 50,70 80,45 C110,20 140,60 170,30 C185,15 195,20 200,10 L200,80 Z"
                      fill="url(#chart-gradient)"
                    />
                    <path
                      d="M0,50 C30,40 50,70 80,45 C110,20 140,60 170,30 C185,15 195,20 200,10"
                      fill="none"
                      stroke="hsl(var(--accent))"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Recent Records Card */}
              <div className="flex-1 basis-0 bg-background border border-border rounded-xl p-4 flex flex-col">
                <div className="flex items-center justify-between mb-3 text-sm font-semibold text-foreground">
                  Recent Records
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-5 w-5 rounded">
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-5 w-5 rounded">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-col flex-1 pb-1">
                  <div className="flex items-center justify-between py-3">
                    <span className="font-medium text-foreground">Blood Panel</span>
                    <span className="text-muted-foreground">12-Mar-2026</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="font-medium text-foreground">MRI Scan</span>
                    <span className="text-muted-foreground">05-Mar-2026</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="font-medium text-foreground">Prescription</span>
                    <span className="text-muted-foreground">28-Feb-2026</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-background border border-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Access & Audit Log</h3>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-muted-foreground text-[10px] uppercase font-medium">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">User</th>
                    <th className="pb-2 font-medium">Action</th>
                    <th className="pb-2 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  <tr className="border-t border-border">
                    <td className="py-2.5 text-muted-foreground">Today, 10:42 AM</td>
                    <td className="py-2.5 font-medium">Dr. Smith</td>
                    <td className="py-2.5">Access Request</td>
                    <td className="py-2.5 text-right"><span className="text-amber-500 font-medium bg-amber-500/10 px-2 py-0.5 rounded-md">Pending</span></td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="py-2.5 text-muted-foreground">Yesterday, 14:15 PM</td>
                    <td className="py-2.5 font-medium">Dr. Patel</td>
                    <td className="py-2.5">Access Granted</td>
                    <td className="py-2.5 text-right"><span className="text-green-600 font-medium bg-green-500/10 px-2 py-0.5 rounded-md">Active</span></td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="py-2.5 text-muted-foreground">14 Mar, 09:00 AM</td>
                    <td className="py-2.5 font-medium">Apollo Hospital</td>
                    <td className="py-2.5">Record Minted</td>
                    <td className="py-2.5 text-right"><span className="text-foreground font-medium bg-secondary px-2 py-0.5 rounded-md">Confirmed</span></td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="py-2.5 text-muted-foreground">10 Mar, 16:30 PM</td>
                    <td className="py-2.5 font-medium">Alliance Insurance</td>
                    <td className="py-2.5">Claim Verified</td>
                    <td className="py-2.5 text-right"><span className="text-blue-600 font-medium bg-blue-500/10 px-2 py-0.5 rounded-md">Approved</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
