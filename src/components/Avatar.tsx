"use client";

import Image from "next/image";
import { useState } from "react";

interface AvatarProps {
  src: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-12 h-12 text-lg",
  md: "w-16 h-16 text-xl",
  lg: "w-24 h-24 text-3xl",
};

export default function Avatar({ src, name, size = "md", className = "" }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const initials = name.split(" ").map(n => n[0]).join("");

  const sizeClass = sizeClasses[size];
  const pixelSize = size === "sm" ? 48 : size === "md" ? 64 : 96;

  if (imageError || !src) {
    return (
      <div
        className={`${sizeClass} bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center text-white font-bold ${className}`}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={`${sizeClass} rounded-full overflow-hidden relative ${className}`}>
      <Image
        src={src}
        alt={name}
        width={pixelSize}
        height={pixelSize}
        className="object-cover w-full h-full"
        onError={() => setImageError(true)}
      />
    </div>
  );
}
