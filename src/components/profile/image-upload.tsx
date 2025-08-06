// src/components/profile/image-upload.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (image: File | string) => void;
}

export default function ImageUpload({ currentImage, onImageChange }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImage);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onImageChange(file);
  };

  const handleRemoveImage = () => {
    setPreviewUrl(undefined);
    onImageChange("/placeholder.svg");
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-32 w-32 relative group">
        <AvatarImage src={previewUrl || "/placeholder.svg"} alt="Profile" />
        <AvatarFallback className="text-2xl">{previewUrl ? "" : "User"}</AvatarFallback>

        {previewUrl && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemoveImage}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </Avatar>

      <div className="flex flex-col items-center">
        <Label
          htmlFor="profile-image"
          className="cursor-pointer inline-flex items-center px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium"
        >
          <Upload className="mr-2 h-4 w-4" />
          {previewUrl ? "Change Image" : "Upload Image"}
        </Label>
        <input 
          id="profile-image" 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          className="sr-only" 
        />
        <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF (max. 5MB)</p>
      </div>
    </div>
  );
}