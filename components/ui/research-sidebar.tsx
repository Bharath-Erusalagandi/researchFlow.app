"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { Home, GraduationCap, BookOpen, Search, User, FileText, Mail, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ResearchSidebar() {
  const links = [
    {
      label: "Home",
      href: "/",
      icon: (
        <Home className="text-gray-100 h-5 w-5 flex-shrink-0 transition-all duration-200" />
      ),
    },
    {
      label: "Professors",
      href: "/professors",
      icon: (
        <GraduationCap className="text-gray-100 h-5 w-5 flex-shrink-0 transition-all duration-200" />
      ),
    },
    {
      label: "Research",
      href: "/research",
      icon: (
        <BookOpen className="text-gray-100 h-5 w-5 flex-shrink-0 transition-all duration-200" />
      ),
    },
    {
      label: "Search",
      href: "/search",
      icon: (
        <Search className="text-gray-100 h-5 w-5 flex-shrink-0 transition-all duration-200" />
      ),
    },
    {
      label: "Profile",
      href: "/profile",
      icon: (
        <User className="text-gray-100 h-5 w-5 flex-shrink-0 transition-all duration-200" />
      ),
    },
    {
      label: "Publications",
      href: "/publications",
      icon: (
        <FileText className="text-gray-100 h-5 w-5 flex-shrink-0 transition-all duration-200" />
      ),
    },
    {
      label: "Contact",
      href: "/contact",
      icon: (
        <Mail className="text-gray-100 h-5 w-5 flex-shrink-0 transition-all duration-200" />
      ),
    }
  ];
  
  const [open, setOpen] = useState(false);
  
  return (
    <div className="h-screen flex">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody 
          className="justify-between gap-0 border-r dark:border-gray-800/30"
          style={{
            background: 'linear-gradient(180deg, rgba(20,20,20,1) 0%, rgba(15,15,15,0.95) 100%)',
            boxShadow: '0 0 20px rgba(0,0,0,0.5), 0 0 30px rgba(12,242,160,0.03) inset'
          }}
        >
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden pt-6">
            <div className="flex-1 flex flex-col justify-start gap-2 px-3">
              {links.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  className={cn(
                    "flex items-center py-3 rounded-lg transition-all duration-200",
                    "hover:bg-[#0CF2A0]/10 hover:text-white group",
                    "relative overflow-hidden",
                    link.href === "/search" ? "bg-[#0CF2A0]/15 text-[#0CF2A0]" : "text-gray-300",
                    open ? "px-4 gap-3 justify-start" : "px-3 justify-center"
                  )}
                >
                  {React.cloneElement(link.icon, {
                    className: cn(
                      link.icon.props.className,
                      "flex-shrink-0",
                      link.href === "/search" ? "text-[#0CF2A0]" : "text-gray-100"
                    )
                  })}
                  {open && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={cn(
                        "font-medium whitespace-nowrap transition-colors",
                        link.href === "/search" ? "text-[#0CF2A0]" : "text-gray-100"
                      )}
                    >
                      {link.label}
                    </motion.span>
                  )}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0CF2A0]/5 to-transparent opacity-0 group-hover:opacity-100 animate-pulse-slow"></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="mt-4 border-t border-gray-800/50 pt-4 pb-6 px-3 space-y-2">
            <Link
              href="/settings"
              className={cn(
                "flex items-center py-3 rounded-lg transition-all duration-200 text-gray-300",
                "hover:bg-[#0CF2A0]/10 hover:text-white group",
                open ? "px-4 gap-3 justify-start" : "px-3 justify-center"
              )}
            >
              <Settings className="h-5 w-5 flex-shrink-0 text-gray-100 transition-all duration-200" />
              {open && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-medium text-gray-100 whitespace-nowrap"
                >
                  Settings
                </motion.span>
              )}
            </Link>
            
            <Link
              href="/logout"
              className={cn(
                "flex items-center py-3 rounded-lg transition-all duration-200 text-gray-300",
                "hover:bg-[#0CF2A0]/10 hover:text-white group",
                open ? "px-4 gap-3 justify-start" : "px-3 justify-center"
              )}
            >
              <LogOut className="h-5 w-5 flex-shrink-0 text-gray-100 transition-all duration-200" />
              {open && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-medium text-gray-100 whitespace-nowrap"
                >
                  Logout
                </motion.span>
              )}
            </Link>
          </div>
        </SidebarBody>
      </Sidebar>
    </div>
  );
} 