import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Calendar,
  ListTodo,
  Bell,
  PlusCircle,
  Menu,
  X,
  Tag,
  FolderOpen,
  Users,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountsApi } from "@/api/apis/accounts-api";
import type { Profile as ApiProfile } from "@/api/models/profile";
import customAxios from "@/lib/customAxios";

const api = new AccountsApi(undefined, undefined, customAxios);

const routes = [
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
  {
    label: "Notifications",
    icon: Bell,
    href: "/notifications",
    color: "text-blue-500",
  },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [profile, setProfile] = useState<ApiProfile | null>(null);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.accountsProfileRead();
        setProfile(response.data);
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };

    fetchProfile();
  }, []);

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

  const handleLogout = async () => {
    try {
      await api.accountsLogoutCreate({ 
        refresh: localStorage.getItem("refresh_token") || "" 
      });
      
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      delete customAxios.defaults.headers.common['Authorization'];
      
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      navigate("/login", { replace: true });
    }
  };

  const userEmail = profile?.user?.email || "user@example.com";
  const userName = profile?.user?.first_name && profile?.user?.last_name
    ? `${profile.user.first_name} ${profile.user.last_name}`
    : profile?.user?.first_name || profile?.user?.email?.split('@')[0] || "User";
  const userInitials = profile?.user?.first_name && profile?.user?.last_name
    ? `${profile.user.first_name[0]}${profile.user.last_name[0]}`.toUpperCase()
    : (profile?.user?.first_name?.[0] || profile?.user?.email?.[0] || "U").toUpperCase();

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
            to="/"
            className={cn("flex items-center pl-3 mb-8", !isOpen && !isMobile ? "justify-center pl-0" : "")}
          >
            {isOpen || isMobile ? (
              <h1 className="text-2xl font-bold">TaskMind</h1>
            ) : (
              <h1 className="text-2xl font-bold">TM</h1>
            )}
          </Link>

          <div className="space-y-1">
            <Link to="/tasks/new">
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
                to={route.href}
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

        {/* Profile Section */}
        <div className="border-t pt-3 px-3 pb-2">
          {isOpen || isMobile ? (
            <div className="space-y-2">
              <Link to="/profile">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {profile?.profile_picture ? (
                      <img 
                        src={profile.profile_picture} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      userInitials
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{userName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
                  </div>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Link to="/profile">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-violet-500 transition">
                  {profile?.profile_picture ? (
                    <img 
                      src={profile.profile_picture} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    userInitials
                  )}
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
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