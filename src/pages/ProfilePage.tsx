import React, { useEffect, useState } from "react";
import ProfileView from "@/components/profile/profile-view";
import { AccountsApi } from "@/api/apis/accounts-api";
import type { Profile as ApiProfile } from "@/api/models/profile";
import type { User as UIUser } from "@/components/profile/profile-view";
import { Loader } from "lucide-react";
import customAxios from "@/lib/customAxios";
import { useNavigate } from "react-router-dom";

const api = new AccountsApi(undefined, undefined, customAxios);

const convertProfileToUser = (profile: ApiProfile): UIUser => {
  return {
    id: "user-id",
    email: profile.user?.email || "",
    firstName: profile.user?.first_name || "",
    lastName: profile.user?.last_name || "",
    profileImage: profile.profile_picture || "/placeholder.svg",
    bio: profile.bio || "",
    experience: profile.experience || "",
    skills: (profile.skills || "")
      .split(",")
      .filter((s) => s.trim())
      .map((name, index) => ({ id: String(index), name: name.trim() })),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

const convertUserToProfile = (user: UIUser): FormData => {
  const formData = new FormData();
  
  if (user.firstName) formData.append('user.first_name', user.firstName);
  if (user.lastName) formData.append('user.last_name', user.lastName);
  if (user.bio) formData.append('bio', user.bio);
  if (user.experience) formData.append('experience', user.experience);
  if (user.skills.length > 0) {
    formData.append('skills', user.skills.map(s => s.name).join(','));
  }

  if (user.profileImage instanceof File) {
    formData.append('profile_picture', user.profileImage);
  } else if (user.profileImage === null || user.profileImage === '') {
    formData.append('profile_picture', '');
  }

  return formData;
};

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UIUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.accountsProfileRead();
        const data = convertProfileToUser(response.data);
        setUser(data);
      } catch (error) {
        console.error("Failed to load profile:", error);
        // Redirect to login if unauthorized
        if ((error as any).response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleSave = async (updatedUser: UIUser) => {
    try {
      const formData = convertUserToProfile(updatedUser);
      
      const response = await customAxios.put('/accounts/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = convertProfileToUser(response.data);
      setUser(data);
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      if (err.response) {
        console.error("API responded with:", err.response.data);
        alert(`Update failed: ${JSON.stringify(err.response.data)}`);
      } else {
        alert("Failed to update profile. Please try again.");
      }
    }
  };

  const handleLogout = async () => {
    try {
      // Call the logout API
      await api.accountsLogoutCreate({ 
        refresh: localStorage.getItem("refresh_token") || "" 
      });
      
      // Clear local storage
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      
      // Clear axios headers
      delete customAxios.defaults.headers.common['Authorization'];
      
      // Redirect to login
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      // Fallback: clear local storage anyway
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      navigate("/login", { replace: true });
    }
  };

  if (loading || !user) {
    return (
      <div className="container max-w-4xl py-6 mx-auto text-center">
        <Loader className="animate-spin w-6 h-6 mx-auto mb-2" />
        Loading profile...
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-6 mx-auto">
      <h1 className="text-3xl font-bold mb-8">User Profile</h1>
      <ProfileView 
        initialUser={user} 
        onSave={handleSave} 
        onLogout={handleLogout} 
      />
    </div>
  );
};

export default ProfilePage;