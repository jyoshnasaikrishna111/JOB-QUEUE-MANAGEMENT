import React, { useState } from 'react';
import { JobProvider, useJobs } from './context/JobContext';
import { SimulationProvider } from './context/SimulationContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { JobManagementPage } from './components/jobs/JobManagementPage';
import { QueueVisualizerPage } from './components/queues/QueueVisualizerPage';
import { SimulatorPage } from './components/simulator/SimulatorPage';
import { GanttChartPage } from './components/gantt/GanttChartPage';
import { ComparisonPage } from './components/comparison/ComparisonPage';
import { ProcessDetailPage } from './components/process/ProcessDetailPage';
import { JobModal } from './components/jobs/JobModal';
import { NotificationToast } from './components/common/NotificationToast';

const MainApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);

  const { addJob, jobs } = useJobs();

  return (
    <div className="flex min-h-screen bg-[#070b14] text-slate-100">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Topbar */}
        <Topbar
          activeTab={activeTab}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-grid-pattern">
          {activeTab === 'dashboard' && (
            <DashboardPage
              setActiveTab={setActiveTab}
              onOpenAddJob={() => setIsAddJobOpen(true)}
            />
          )}

          {activeTab === 'jobs' && (
            <JobManagementPage setActiveTab={setActiveTab} />
          )}

          {activeTab === 'queues' && (
            <QueueVisualizerPage setActiveTab={setActiveTab} />
          )}

          {activeTab === 'simulator' && (
            <SimulatorPage setActiveTab={setActiveTab} />
          )}

          {activeTab === 'gantt' && (
            <GanttChartPage setActiveTab={setActiveTab} />
          )}

          {activeTab === 'comparison' && (
            <ComparisonPage setActiveTab={setActiveTab} />
          )}

          {activeTab === 'process' && (
            <ProcessDetailPage setActiveTab={setActiveTab} />
          )}
        </main>

        {/* Professional Academic Footer */}
        <footer className="border-t border-slate-800/80 bg-[#070b14]/90 px-6 py-4 text-center text-xs text-slate-400">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <p>
              OS-Based Job Queue Management & Scheduling Simulator &bull; Final Year / Mini Project Demonstration
            </p>
            <p className="font-mono text-[11px] text-cyan-400">
              Developed by Deepika &bull; CS & Engineering
            </p>
          </div>
        </footer>
      </div>

      {/* Quick Add Job Global Modal */}
      <JobModal
        isOpen={isAddJobOpen}
        onClose={() => setIsAddJobOpen(false)}
        onSubmit={async (jobData) => {
          await addJob(jobData);
        }}
        existingJobIds={jobs.map((j) => j.jobId)}
      />

      {/* Notifications */}
      <NotificationToast />
    </div>
  );
};

export default function App() {
  return (
    <JobProvider>
      <SimulationProvider>
        <MainApp />
      </SimulationProvider>
    </JobProvider>
  );
}
