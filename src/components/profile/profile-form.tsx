// src/components/profile/profile-form.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from "lucide-react";
import ImageUpload from "@/components/profile/image-upload";
import SkillsInput from "@/components/profile/skills-input";

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

interface ProfileFormProps {
  user: User;
  onSave: (user: User) => void;
  onCancel: () => void;
}

export default function ProfileForm({ user, onSave, onCancel }: ProfileFormProps) {
  const [formData, setFormData] = useState<User>({ ...user });
  const [bioCharCount, setBioCharCount] = useState(user.bio.length);
  const BIO_MAX_LENGTH = 500;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "bio") {
      if (value.length <= BIO_MAX_LENGTH) {
        setBioCharCount(value.length);
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (image: File | string) => {
    setFormData({ ...formData, profileImage: image });
  };

  const handleSkillsChange = (skills: Skill[]) => {
    setFormData({ ...formData, skills });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      updatedAt: new Date(),
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center space-y-4">
              <ImageUpload 
                currentImage={formData.profileImage instanceof File ? undefined : formData.profileImage}
                onImageChange={handleImageChange} 
              />
            </div>

            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} disabled />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="bio">Bio</Label>
                  <span className="text-xs text-muted-foreground">
                    {bioCharCount}/{BIO_MAX_LENGTH}
                  </span>
                </div>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  maxLength={BIO_MAX_LENGTH}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Textarea
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <SkillsInput skills={formData.skills} onChange={handleSkillsChange} />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}