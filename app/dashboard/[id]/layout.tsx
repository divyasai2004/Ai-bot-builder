"use client";

import Link from "next/link";
import {
  useParams,
  usePathname,
} from "next/navigation";

import {
  Bot,
  BookOpen,
  BarChart3,
  MessageSquare,
  LayoutDashboard,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const botId = params.id as string;

  const menus = [
    {
      title: "Bot Settings",
      description: "Customize assistant",
      href: `/dashboard/${botId}`,
      icon: Bot,
    },
    {
      title: "Playground",
      description: "Test & live chat",
      href: `/playground/${botId}`,
      icon: Sparkles,
    },
    {
      title: "Knowledge Base",
      description: "Manage bot knowledge",
      href: `/dashboard/${botId}/knowledge`,
      icon: BookOpen,
    },
    {
      title: "Analytics",
      description: "View performance",
      href: `/dashboard/${botId}/analytics`,
      icon: BarChart3,
    },
    {
      title: "Conversations",
      description: "Review visitor chats",
      href: `/dashboard/${botId}/conversations`,
      icon: MessageSquare,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950">

      {/* MOBILE HEADER */}

      <header className="lg:hidden sticky top-0 z-40 h-16 bg-zinc-950 border-b border-zinc-800 px-4 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
            <Bot size={20} />
          </div>

          <span className="font-bold text-white">
            AI Bot Builder
          </span>

        </div>

        <button
          onClick={() =>
            setSidebarOpen(!sidebarOpen)
          }
          className="w-10 h-10 rounded-lg border border-zinc-700 text-white flex items-center justify-center hover:bg-zinc-800"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? (
            <X size={21} />
          ) : (
            <Menu size={21} />
          )}
        </button>

      </header>


      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="lg:hidden fixed inset-0 top-16 bg-black/60 backdrop-blur-sm z-40"
        />
      )}


      {/* SIDEBAR */}

      <aside
        className={`
          fixed
          left-0
          top-0
          bottom-0
          z-50
          w-72
          bg-zinc-950
          border-r
          border-zinc-800
          flex
          flex-col
          transition-transform
          duration-300

          lg:translate-x-0

          ${
            sidebarOpen
              ? "translate-x-0 top-16 lg:top-0"
              : "-translate-x-full lg:top-0"
          }
        `}
      >

        {/* BRAND */}

        <div className="hidden lg:flex h-20 px-6 items-center border-b border-zinc-800">

          <Link
            href="/"
            className="flex items-center gap-3"
          >

            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <Bot size={23} />
            </div>

            <div>
              <p className="text-white font-bold">
                AI Bot Builder
              </p>

              <p className="text-xs text-zinc-500">
                Assistant Platform
              </p>
            </div>

          </Link>

        </div>


        {/* DASHBOARD BUTTON */}

        <div className="p-4">

          <Link
            href="/dashboard"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="
              flex
              items-center
              gap-3
              px-4
              py-3
              rounded-xl
              bg-zinc-900
              border
              border-zinc-800
              text-zinc-300
              hover:text-white
              hover:border-zinc-700
              transition
            "
          >
            <LayoutDashboard size={19} />

            <span className="font-medium">
              All Bots
            </span>
          </Link>

        </div>


        {/* MENU */}

        <div className="px-4 mt-3">

          <p className="px-3 mb-3 text-[11px] font-semibold text-zinc-600 uppercase tracking-[0.16em]">
            Bot Menu
          </p>

          <nav className="space-y-1.5">

            {menus.map((menu) => {

              const Icon = menu.icon;

              const isActive =
                pathname === menu.href;

              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  onClick={() =>
                    setSidebarOpen(false)
                  }
                  className={`
                    group
                    flex
                    items-center
                    gap-3
                    px-3
                    py-3
                    rounded-xl
                    transition-all

                    ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                    }
                  `}
                >

                  <div
                    className={`
                      w-9
                      h-9
                      rounded-lg
                      flex
                      items-center
                      justify-center

                      ${
                        isActive
                          ? "bg-white/15"
                          : "bg-zinc-900 group-hover:bg-zinc-800"
                      }
                    `}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0">

                    <p className="font-medium text-sm">
                      {menu.title}
                    </p>

                    <p
                      className={`
                        text-xs mt-0.5

                        ${
                          isActive
                            ? "text-blue-100"
                            : "text-zinc-600"
                        }
                      `}
                    >
                      {menu.description}
                    </p>

                  </div>

                </Link>
              );
            })}

          </nav>

        </div>


        {/* SIDEBAR BOTTOM */}

        <div className="mt-auto p-4">

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">

            <div className="w-9 h-9 rounded-lg bg-blue-600/15 text-blue-400 flex items-center justify-center mb-3">
              <Sparkles size={18} />
            </div>

            <p className="text-sm font-semibold text-white">
              AI-powered assistant
            </p>

            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Manage knowledge, appearance,
              conversations and performance.
            </p>

          </div>

        </div>

      </aside>


      {/* PAGE CONTENT */}

      <main className="lg:ml-72 min-h-screen bg-zinc-50">
        {children}
      </main>

    </div>
  );
}
