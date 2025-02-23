"use client";

import type React from "react";
import { useState, useRef } from "react";
import {
  Upload,
  Loader2,
  X,
  Image,
  File,
  UploadCloudIcon,
  Video,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useEdgeStore } from "@/lib/edgestore";

const FileUploadZone = ({
  InsertMedia,
}: {
  InsertMedia: (files: { url: string; alt: string }[]) => void;
}) => {
  const [draggedZone, setDraggedZone] = useState<number | null>(null);
  const [files, setFiles] = useState<{ url: string; alt: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { edgestore } = useEdgeStore();

  const handleDragEnter = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedZone(index);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedZone(null);
  };

  //   loading
  const upload = async (newFiles: File[]) => {
    setUploading(true);
    setProgress(0);

    // Store uploaded files
    let uploadedFiles: { url: string; alt: string }[] = [];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];

      try {
        const response = await edgestore.publicFiles.upload({
          file,
          onProgressChange: (progress) => {
            setProgress(
              Math.round((progress / 100) * ((i + 1) / newFiles.length) * 100)
            );
          },
        });

        uploadedFiles.push({ url: response.url, alt: file.name });
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
      }
    }

    setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
    setUploading(false);
    setProgress(100);
  };

  const handleDrop = () => async (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedZone(null);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      await upload(droppedFiles);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      await upload(selectedFiles);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const zones = [
    {
      title: "Upload Images",
      subtitle: "Drop images here",
      icon: Image,
      gradient: "from-purple-400 via-pink-500 to-red-500",
      rotate: "-rotate-2",
    },
    {
      title: "Upload Videos",
      subtitle: "Drop videos here",
      icon: Video,
      gradient: "from-blue-400 via-teal-500 to-green-500",
      rotate: "",
    },
    {
      title: "Upload Files",
      subtitle: "Drop files here",
      icon: UploadCloudIcon,
      gradient: "from-yellow-400 via-orange-500 to-red-500",
      rotate: "rotate-3",
    },
  ];

  return (
    <Card className="mx-auto w-full  bg-transparent border-none max-w-[300px] lg:max-w-[500px] overflow-hidden rounded-[1rem]">
      <CardContent className="p-6 py-7   cursor:pointer">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {zones.map((zone, index) => (
            <div key={index} className={`relative ${zone.rotate}`}>
              <motion.div
                onDragEnter={handleDragEnter(index)}
                onDragOver={(e: { preventDefault: () => any }) =>
                  e.preventDefault()
                }
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative h-full"
              >
                <div
                  className={`
                    absolute inset-0 -z-10 rounded-xl bg-gradient-to-br ${
                      zone.gradient
                    }
                    opacity-0 blur-md transition-opacity duration-300
                    ${
                      draggedZone === index
                        ? "opacity-70"
                        : "group-hover:opacity-70"
                    }
                  `}
                />
                <Card className="relative h-full rounded-[1rem] overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-800 transition-colors duration-300 group-hover:border-transparent">
                  <CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 mb-4"
                    >
                      <zone.icon className="h-8 w-8 text-gray-500" />
                    </motion.div>
                    <h3 className="mb-1 text-sm font-medium">{zone.title}</h3>
                    <p className="text-xs text-gray-500">{zone.subtitle}</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          ))}
        </div>

        {(uploading || files.length > 0) && (
          <div className="mb-6">
            <Progress value={uploading ? progress : 100} className="h-2 mb-2" />
            <p className="text-sm text-gray-500 mb-2">
              {uploading
                ? `Uploading... ${progress}%`
                : `${files.length} file(s) uploaded`}
            </p>
            <AnimatePresence>
              {files.map((file, index) => (
                <motion.div
                  key={`${file.alt}-${index}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-[1rem] p-2 mb-2"
                >
                  <span className="truncate max-w-[80%] text-sm text-gray-700 dark:text-gray-300 ml-2">
                    {file.alt}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                    className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="text-center flex flex-col">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-[1rem] mt-5"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Choose Files
              </>
            )}
          </Button>

          {files.length > 0 && (
            <Button
              onClick={() => InsertMedia(files)}
              disabled={uploading}
              className="rounded-[1rem] mt-2"
            >
              Insert the {files.length == 1 ? "image" : "images"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploadZone;
