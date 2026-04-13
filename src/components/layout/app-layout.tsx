import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import TopBar from "./top-bar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F1F5F9] overflow-hidden print-layout-wrapper">
      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* 侧边栏 */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* 主内容区 */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden print-layout-main">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto page-content-area">
          <div className="p-4 md:p-6 page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
