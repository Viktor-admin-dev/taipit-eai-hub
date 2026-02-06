"use client";

import Image from "next/image";
import { useState } from "react";

interface AvatarProps {
  src: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-14 h-14 text-lg",
  md: "w-20 h-20 text-2xl",
  lg: "w-32 h-32 text-4xl",
  xl: "w-40 h-40 text-5xl",
};

export default function Avatar({ src, name, size = "md", className = "" }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const initials = name.split(" ").map(n => n[0]).join("");

  const sizeClass = sizeClasses[size];
  const pixelSizes = { sm: 56, md: 80, lg: 128, xl: 160 };
  const pixelSize = pixelSizes[size];

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
