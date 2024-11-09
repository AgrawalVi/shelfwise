'use client'

import { uploadImage } from "@/actions/image-upload.ts/upload-image";
import Image from "next/image";

export default function Home() {
  const handleClick = async() => {
    await uploadImage(new FormData())
  }

  return (
    <button onClick={handleClick}>
      test
    </button>
  );
}
