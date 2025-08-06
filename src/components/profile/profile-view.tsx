import { useState } from "react";
import ProfileForm from "./profile-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type Skill = {
  id: string;
  name: string;
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string | File;
  bio: string;
  experience: string;
  skills: Skill[];
  createdAt: Date;
  updatedAt: Date;
};

interface ProfileViewProps {
  initialUser: User;
  onSave: (user: User) => void;
  onLogout: () => Promise<void>;
}

export default function ProfileView({ initialUser, onSave, onLogout }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<User>(initialUser);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const getImageUrl = () => {
    if (user.profileImage instanceof File) {
      return URL.createObjectURL(user.profileImage);
    }
    return user.profileImage || "/placeholder.svg";
  };

  const handleSave = (updatedUser: User) => {
    setUser(updatedUser);
    onSave(updatedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleLogoutClick = async () => {
    if (confirm("Are you sure you want to logout?")) {
      setIsLoggingOut(true);
      try {
        await onLogout();
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        setIsLoggingOut(false);
      }
    }
  };

  if (isEditing) {
    return <ProfileForm user={user} onSave={handleSave} onCancel={handleCancel} />;
  }

  const getInitials = () => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={getImageUrl()} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2 w-full">
              <Button variant="outline" className="w-full bg-transparent" onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={handleLogoutClick}
                disabled={isLoggingOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Bio</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{user.bio}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Experience</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{user.experience}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill) => (
                  <Badge key={skill.id} variant="secondary">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}