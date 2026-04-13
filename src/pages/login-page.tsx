import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { Eye, EyeOff, Shield, Cpu, MapPin } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("请输入用户名和密码");
      return;
    }
    setLoading(true);
    setError("");
    const ok = await login(username, password);
    setLoading(false);
    if (ok) {
      navigate("/projects");
    } else {
      setError("用户名或密码错误，请重试");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0F172A]">
      {/* 左侧品牌区 */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #2D5F8B 100%)" }}>
        {/* 动态背景装饰 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl bg-[#2D5F8B] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-10 blur-2xl bg-[#E8873A] animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        {/* 网格背景 */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "linear-gradient(#2D5F8B 1px, transparent 1px), linear-gradient(90deg, #2D5F8B 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="relative z-10 flex flex-col items-center px-12 text-center">
          {/* Logo */}
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-8 shadow-2xl"
            style={{ background: "linear-gradient(135deg, #1E3A5F, #2D5F8B)", border: "2px solid rgba(232,135,58,0.4)" }}>
            <Cpu className="w-12 h-12 text-[#E8873A]" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-wide">无人机道路巡检</h1>
          <h2 className="text-2xl font-semibold text-[#E8873A] mb-2">智能管理平台</h2>
          <p className="text-slate-500 text-xs mb-6 font-mono">道路病害无人机巡检管理系统 v1.0.0</p>
          <p className="text-slate-300 text-base leading-relaxed max-w-sm mb-10">
            集成 YOLOv 系列 AI 视觉模型，实现路面病害精准识别、像素级分割分析与全生命周期管理
          </p>
          {/* 功能特性 */}
          <div className="flex flex-col gap-4 w-full max-w-xs">
            {[
              { icon: Cpu, text: "YOLOv8/v11 AI 病害识别" },
              { icon: MapPin, text: "像素级裂缝分割分析" },
              { icon: Shield, text: "全项目生命周期管理" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                <Icon className="w-5 h-5 text-[#E8873A] flex-shrink-0" />
                <span className="text-slate-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 右侧登录表单 */}
      <div className="flex-1 flex items-center justify-center px-6 py-12"
        style={{ background: "linear-gradient(160deg, #0F172A 0%, #1a2744 100%)" }}>
        <div className="w-full max-w-md">
          {/* 移动端 Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#1E3A5F]">
              <Cpu className="w-6 h-6 text-[#E8873A]" />
            </div>
            <span className="text-white font-bold text-lg">无人机道路巡检平台</span>
          </div>

          {/* 表单卡片 */}
          <div className="rounded-2xl p-8 shadow-2xl border border-white/10"
            style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(16px)" }}>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">欢迎登录</h2>
              <p className="text-slate-400 text-sm">请输入您的账号信息以继续使用系统</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* 用户名 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-300 text-sm font-medium">用户名</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="请输入用户名（admin / inspector）"
                  className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-slate-500 outline-none border transition-all duration-200 focus:border-[#E8873A] focus:ring-2 focus:ring-[#E8873A]/20"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </div>

              {/* 密码 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-300 text-sm font-medium">密码</label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="请输入密码（admin123 / 123456）"
                    className="w-full px-4 py-3 pr-12 rounded-xl text-white text-sm placeholder-slate-500 outline-none border transition-all duration-200 focus:border-[#E8873A] focus:ring-2 focus:ring-[#E8873A]/20"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
                    {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-300 bg-red-500/10 border border-red-500/20">
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* 登录按钮 */}
              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg"
                style={{ background: "linear-gradient(135deg, #E8873A, #d97706)" }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    正在登录…
                  </span>
                ) : "登 录"}
              </button>
            </form>

            <p className="mt-6 text-center text-slate-500 text-xs">
              演示账号：admin / admin123　或　inspector / 123456
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
