"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { imageSource } from "@/lib/image-source";

type Props = Omit<ImageProps, "src" | "unoptimized" | "onError"> & { src: string | null | undefined; fallback?: string };

export default function DatabaseImage({ src, alt, fallback = "/images/hero.png", ...props }: Props) {
  const source = imageSource(src, fallback);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const image = failedSource === source.src ? imageSource(fallback) : source;
  return <Image {...props} {...image} alt={alt} referrerPolicy="no-referrer" onError={() => setFailedSource(source.src)} />;
}
