import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Calendar,
  LayoutDashboard,
  ListTodo,
  BarChart3,
  Settings,
  Bell,
  PlusCircle,
  Sparkles,
  Menu,
  X,
  Tag,
  FolderOpen,
  Users,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const routes = [
  // {
  //   label: "Dashboard",
  //   icon: LayoutDashboard,
  //   href: "/dashboard",
  //   color: "text-sky-500",
  // },
  {
    label: "Tasks",
    icon: ListTodo,
    href: "/tasks",
    color: "text-violet-500",
  },
  {
    label: "Projects",
    icon: FolderOpen,
    href: "/projects",
    color: "text-indigo-500",
  },
  {
    label: "Teams",
    icon: Users,
    href: "/teams",
    color: "text-cyan-500",
  },
  {
    label: "Profile",
    icon: User,
    href: "/profile",
    color: "text-purple-500",
  },
  {
    label: "Calendar",
    icon: Calendar,
    href: "/calendar",
    color: "text-pink-700",
  },
  {
    label: "Categories",
    icon: Tag,
    href: "/categories",
    color: "text-green-600",
  },
  // {
  //   label: "AI Suggestions",
  //   icon: Sparkles,
  //   href: "/suggestions",
  //   color: "text-emerald-500",
  // },
  // {
  //   label: "Statistics",
  //   icon: BarChart3,
  //   href: "/statistics",
  //   color: "text-orange-500",
  // },
  {
    label: "Notifications",
    icon: Bell,
    href: "/notifications",
    color: "text-blue-500",
  },
  // {
  //   label: "Settings",
  //   icon: Settings,
  //   href: "/settings",
  //   color: "text-gray-500",
  // },
];

export default function Sidebar() {
  const { pathname } = useLocation(); // Replaces Next.js's `usePathname()`
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 bg-background"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "h-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-r transition-all duration-300 ease-in-out z-40",
          isOpen ? "w-64" : "w-0 md:w-20",
          isMobile && isOpen ? "fixed inset-y-0 left-0" : "",
          isMobile && !isOpen ? "hidden" : "flex flex-col py-4",
        )}
      >
        <div className={cn("px-3 py-2 flex-1 overflow-hidden", !isOpen && !isMobile ? "items-center" : "")}>
          <Link
            to="/" // Changed from `href` to `to`
            className={cn("flex items-center pl-3 mb-8", !isOpen && !isMobile ? "justify-center pl-0" : "")}
          >
            {isOpen || isMobile ? (
              // <h1 className="text-2xl font-bold">TaskMaster</h1>
              <h1 className="text-2xl font-bold">Plan Genie AI</h1>
            ) : (
              <h1 className="text-2xl font-bold">TM</h1>
            )}
          </Link>

          <div className="space-y-1">
            <Link to="/tasks/new"> {/* Changed from `href` to `to` */}
              <Button
                className={cn("mb-6", isOpen || isMobile ? "w-full justify-start" : "w-full justify-center px-0")}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                {isOpen || isMobile ? "New Task" : ""}
              </Button>
            </Link>

            {routes.map((route) => (
              <Link
                key={route.href}
                to={route.href} // Changed from `href` to `to`
                className={cn(
                  "text-sm group flex p-3 w-full font-medium cursor-pointer hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition",
                  pathname === route.href
                    ? "bg-gray-100 dark:bg-gray-800 text-primary"
                    : "text-gray-600 dark:text-gray-400",
                  !isOpen && !isMobile ? "justify-center p-2" : "",
                )}
              >
                <div className={cn("flex items-center", isOpen || isMobile ? "flex-1" : "flex-col")}>
                  <route.icon className={cn("h-5 w-5", route.color, isOpen || isMobile ? "mr-3" : "mb-1")} />
                  {(isOpen || isMobile) && route.label}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop toggle button */}
        <div className="hidden md:flex justify-center p-3 border-t">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
            {isOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}