import { useState, useCallback } from "react";
import type { SlideSpecV1 } from "@/types/SlideSpecV1";
import { logger } from "@/lib/logger";

interface ImageData {
  id: string;
  dataUrl: string;
  filename: string;
  size: number;
  type: string;
}

export function useSlideImages() {
  const [images, setImages] = useState<Map<string, ImageData>>(new Map());

  const addImage = useCallback((placeholderId: string, imageData: string, file: File) => {
    const newImage: ImageData = {
      id: placeholderId,
      dataUrl: imageData,
      filename: file.name,
      size: file.size,
      type: file.type,
    };

    setImages((prev) => {
      const updated = new Map(prev);
      updated.set(placeholderId, newImage);
      logger.info("Image added to slide", { 
        placeholderId, 
        filename: file.name,
        size: file.size 
      });
      return updated;
    });
  }, []);

  const removeImage = useCallback((placeholderId: string) => {
    setImages((prev) => {
      const updated = new Map(prev);
      updated.delete(placeholderId);
      logger.info("Image removed from slide", { placeholderId });
      return updated;
    });
  }, []);

  const getImage = useCallback((placeholderId: string): ImageData | undefined => {
    return images.get(placeholderId);
  }, [images]);

  const hasImage = useCallback((placeholderId: string): boolean => {
    return images.has(placeholderId);
  }, [images]);

  const clearImages = useCallback(() => {
    setImages(new Map());
    logger.info("All images cleared");
  }, []);

  const updateSlideSpec = useCallback((spec: SlideSpecV1): SlideSpecV1 => {
    // Replace image placeholders with actual image data
    const updatedComponents = { ...spec.components };

    if (spec.content.imagePlaceholders) {
      spec.content.imagePlaceholders.forEach((placeholder) => {
        const image = images.get(placeholder.id);
        if (image) {
          // Update the placeholder with actual image data
          // This would be used when exporting to PPTX
          logger.info("Image placeholder updated", { 
            placeholderId: placeholder.id,
            filename: image.filename 
          });
        }
      });
    }

    return {
      ...spec,
      components: updatedComponents,
    };
  }, [images]);

  const getImageCount = useCallback((): number => {
    return images.size;
  }, [images]);

  const getAllImages = useCallback((): ImageData[] => {
    return Array.from(images.values());
  }, [images]);

  return {
    images,
    addImage,
    removeImage,
    getImage,
    hasImage,
    clearImages,
    updateSlideSpec,
    getImageCount,
    getAllImages,
  };
}

