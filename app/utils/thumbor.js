/**
 * Thumbor image processing utility for the ICJIA Safe From the Start application.
 * Provides functions to generate optimized image URLs using the Thumbor image service.
 *
 * Thumbor is an open-source smart imaging service that enables on-the-fly image resizing,
 * cropping, and filtering. This utility connects to the ICJIA Thumbor instance at
 * https://image.icjia.cloud to serve optimized images with smart cropping capabilities.
 *
 * @module src/utils/thumbor
 */

import { ThumborUrlBuilder } from "thumbor-url-builder-ts";

/**
 * Generates a Thumbor-processed image URL with specified dimensions and quality settings.
 *
 * This function creates optimized image URLs for responsive images throughout the application.
 * It uses smart cropping to maintain the focal point of images when resizing, and supports
 * modern image formats like WebP for better performance.
 *
 * The function connects to the ICJIA Thumbor service using a security key from environment
 * variables to generate signed URLs that prevent unauthorized image manipulation.
 *
 * @param {Object} params - Image processing parameters
 * @param {string} [params.url="https://sfs.icjia.illinois.gov/error.jpg"] - Source image URL to process
 * @param {number} [params.width=1024] - Target width in pixels
 * @param {number} [params.height=768] - Target height in pixels
 * @param {number} [params.quality=80] - Image quality (0-100, higher is better quality but larger file size)
 * @param {string} [params.format="webp"] - Output image format (e.g., "webp", "jpeg", "png")
 * @returns {string} Signed Thumbor URL for the processed image
 *
 * @example
 * // Generate a thumbnail image
 * const thumbnailUrl = getThumborUrl({
 *   url: 'https://sfs.icjia.illinois.gov/splash-01.jpg',
 *   width: 300,
 *   height: 200,
 *   quality: 60,
 *   format: 'webp'
 * })
 *
 * @example
 * // Use default values for most parameters
 * const defaultUrl = getThumborUrl({
 *   url: 'https://sfs.icjia.illinois.gov/hero-image.jpg'
 * })
 * // Returns 1024x768 WebP image at 80% quality
 */
const getThumborUrl = ({ url, width, height, quality, format }) => {
  // Merge provided options with defaults to ensure all required parameters are set
  let options = {
    url: url || "https://sfs.icjia.illinois.gov/error.jpg", // Fallback to error image if URL not provided
    width: width || 1024, // Default to standard desktop width
    height: height || 768, // Default to standard desktop height
    quality: quality || 80, // Default to high quality (80%)
    format: format || "webp", // Default to WebP for better compression
  };

  // Initialize Thumbor URL builder with security key and service endpoint
  // VITE_THUMBOR_KEY is required for generating signed URLs
  const thumbor = new ThumborUrlBuilder(
    import.meta.env.VITE_THUMBOR_KEY,
    "https://image.icjia.cloud"
  );

  // Build and return the complete Thumbor URL with all transformations
  return thumbor
    .setImagePath(options.url) // Set the source image URL
    .resize(options.width, options.height) // Apply resize transformation
    .filter(`quality(${options.quality}):format('${options.format}')`) // Apply quality and format filters
    .smartCrop(true) // Enable smart cropping to preserve image focal points
    .buildUrl(); // Generate the final signed URL
};

export { getThumborUrl };
