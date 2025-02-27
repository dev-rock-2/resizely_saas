"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { CldImage } from 'next-cloudinary';
import axios from 'axios';
import { useCreditContext } from '@/context';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const socialFormats = {
  "instagram Square (1:1)": { width: 1080, height: 1080, aspectRatio: "1:1" },
  "instagram Portrait (4:5)": { width: 1080, height: 1350, aspectRatio: "4:5" },
  "twitter Post (16:9)": { width: 1200, height: 675, aspectRatio: "16:9" },
  "twitter Header (3:1)": { width: 1500, height: 500, aspectRatio: "3:1" },
  "facebook Cover (205:78)": { width: 820, height: 312, aspectRatio: "205:78" },
};

type SocialFormat = keyof typeof socialFormats;

export default function SocialShare() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<SocialFormat>("instagram Square (1:1)");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isTransforming, setIsTransforming] = useState<boolean>(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const {credits, setCredits } = useCreditContext();
   
  const router = useRouter()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {

    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      if (!credits) {
        return toast.error("insufficient credit's plz buy.")
      }
      const response = await axios.post("/api/image-upload", formData);
      if (!response.data.publicId) throw new Error("Failed to upload image");
      setUploadedImage(response.data.publicId);
      toast.success("Image uploaded successfully!");
    } catch (error:any) {
      toast.error("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = useCallback(async () => {
    if (!imageRef.current) return;
 
    try {
      const response = await fetch(imageRef.current.src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      const res = await axios.get("/api/use-credit");
      console.log(res.data.credit);
      
      if (res.status === 200) {
        setCredits(res.data.credit);
        toast.success("Credit deducted successfully!");
        router.push("/social-share")
      }
    } catch (error:any) {
      toast.error("Failed to download image.");
    }
  }, [setCredits]);

  useEffect(() => {
    if (uploadedImage) {
      setIsTransforming(true);
    }
  }, [selectedFormat, uploadedImage]);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Social Media Image Creator
      </h1>
      <p className="font-bold mb-6 text-xl text-center">
        Resize your photos for any social media platform with AI-powered content awareness – smart, seamless, and pixel-perfect!
      </p>
      <div className="card">
        <div className="card-body">
          <h2 className="card-title mb-4">Upload an Image</h2>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Choose an image file</span>
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              className="file-input file-input-bordered file-input-primary w-full"
            />
          </div>

          {isUploading && (
            <div className="mt-4">
              <progress className="progress progress-primary w-full"></progress>
            </div>
          )}

          {uploadedImage && (
            <div className="mt-6">
              <h2 className="card-title mb-4">Select Social Media Format</h2>
              <div className="form-control">
                <select
                  className="select select-bordered w-full"
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value as SocialFormat)}
                >
                  {Object.keys(socialFormats).map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 relative">
                <h3 className="text-lg font-semibold mb-2">Preview:</h3>
                <div className="flex justify-center">
                  {isTransforming && (
                    <div className="absolute inset-0 flex items-center justify-center bg-base-100 bg-opacity-50 z-10">
                      <span className="loading loading-spinner loading-lg"></span>
                    </div>
                  )}
                  <CldImage
                    width={socialFormats[selectedFormat].width}
                    height={socialFormats[selectedFormat].height}
                    src={uploadedImage}
                    sizes="100vw"
                    alt="transformed image"
                    crop="fill"
                    aspectRatio={socialFormats[selectedFormat].aspectRatio}
                    gravity="auto"
                    ref={imageRef}
                    onLoad={() => setIsTransforming(false)}
                  />
                </div>
              </div>

              <div className="card-actions justify-end mt-6">
                <button className="btn btn-primary" onClick={handleDownload}>
                  Download for {selectedFormat}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
