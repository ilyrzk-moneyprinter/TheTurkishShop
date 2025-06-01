import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { uploadPaymentProof } from '../firebase/orderService';
import { auth } from '../firebase/config';
import { signInAnonymously } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

interface PaymentProofUploadProps {
  orderID: string;
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
}

const PaymentProofUpload: React.FC<PaymentProofUploadProps> = ({ 
  orderID, 
  onUploadSuccess,
  onUploadError 
}) => {
  const { isDarkMode } = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadCompleted, setUploadCompleted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!auth.currentUser) {
        try {
          console.log("No user logged in, trying anonymous sign-in");
          await signInAnonymously(auth);
          console.log("Anonymous sign-in successful");
        } catch (err) {
          console.error('Authentication error:', err);
          setError('Authentication failed. Please try again later.');
        }
      } else {
        console.log("User already authenticated:", auth.currentUser.uid);
      }
    };
    
    checkAuth();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) {
      console.log("No file selected");
      return;
    }
    
    console.log("File selected:", selectedFile.name, selectedFile.type, selectedFile.size);
    
    // Check file type
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, etc.)');
      return;
    }
    
    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      console.log("Preview generated successfully");
    };
    reader.onerror = (err) => {
      console.error("Error generating preview:", err);
      setError("Failed to preview the image. Please try another file.");
    };
    reader.readAsDataURL(selectedFile);
  };

  // Simplified, more reliable upload function
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    // Reset states
    setError(null);
    setIsUploading(true);
    setUploadProgress(10);
    
    try {
      console.log("Starting upload for order:", orderID, "File:", file.name);
      
      // Make sure we're authenticated
      if (!auth.currentUser) {
        console.log("Re-authenticating before upload");
        await signInAnonymously(auth);
      }
      
      // Update progress to show initial upload started
      setUploadProgress(25);
      
      // Create a unique file name
      const fileName = `payment_proof_${orderID}_${Date.now()}`;
      const storageRef = ref(storage, `payment_proofs/${fileName}`);
      
      // Begin direct upload to Firebase Storage
      console.log("Uploading to Firebase Storage...");
      setUploadProgress(40);
      
      // Try to upload the file directly
      try {
        const uploadResult = await uploadBytes(storageRef, file);
        console.log("Storage upload successful:", uploadResult.metadata.name);
        setUploadProgress(70);
        
        // Get the download URL
        console.log("Getting download URL...");
        const downloadUrl = await getDownloadURL(uploadResult.ref);
        console.log("Download URL obtained:", downloadUrl);
        setUploadProgress(85);
        
        // Update the order with the URL
        console.log("Updating order record...");
        await uploadPaymentProof(orderID, downloadUrl);
        console.log("Order updated with payment proof URL");
        
        setUploadProgress(100);
        
        // Short delay to show 100% progress before success
        setTimeout(() => {
          setUploadCompleted(true);
          setIsUploading(false);
          
          if (onUploadSuccess) {
            onUploadSuccess(downloadUrl);
          }
        }, 500);
        
      } catch (storageError) {
        console.error("Storage upload failed, trying fallback method:", storageError);
        
        // Fallback: If direct upload fails, try uploading as data URL
        try {
          setUploadProgress(50);
          const reader = new FileReader();
          
          // Convert file to data URL
          const dataUrl = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          
          console.log("File converted to data URL, length:", dataUrl.length);
          setUploadProgress(70);
          
          // Send the data URL directly to the order service
          console.log("Updating order with data URL...");
          const uploadedUrl = await uploadPaymentProof(orderID, dataUrl);
          console.log("Order updated with data URL payment proof");
          
          setUploadProgress(100);
          
          // Short delay to show 100% progress before success
          setTimeout(() => {
            setUploadCompleted(true);
            setIsUploading(false);
            
            if (onUploadSuccess) {
              onUploadSuccess(uploadedUrl);
            }
          }, 500);
          
        } catch (fallbackError) {
          throw new Error(`Both upload methods failed: ${fallbackError}`);
        }
      }
      
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload file. Please try again.');
      
      // Set progress to 100% even on error to avoid stuck progress bar
      setUploadProgress(100);
      setIsUploading(false);
      
      if (onUploadError) {
        onUploadError(err.message || 'Failed to upload file');
      }
    }
  };

  // Option to use an external image URL instead
  const [externalUrl, setExternalUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleUrlSubmit = async () => {
    if (!externalUrl || !externalUrl.trim().startsWith('http')) {
      setError('Please enter a valid image URL starting with http:// or https://');
      return;
    }
    
    // Reset states
    setError(null);
    setIsUploading(true);
    setUploadProgress(30);
    
    try {
      // Check authentication first
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
      
      // Update progress to indicate processing
      setUploadProgress(60);
      
      // Upload URL to Firestore
      console.log("Saving external URL:", externalUrl);
      const uploadedUrl = await uploadPaymentProof(orderID, externalUrl);
      console.log("External URL saved successfully");
      
      // Set progress to 100% after completion
      setUploadProgress(100);
      
      // Short delay to show 100% progress before success
      setTimeout(() => {
        setUploadCompleted(true);
        setIsUploading(false);
        
        if (onUploadSuccess) {
          onUploadSuccess(uploadedUrl);
        }
      }, 500);
      
    } catch (err: any) {
      console.error("Error saving URL:", err);
      setError(err.message || 'Failed to save image URL');
      
      // Set progress to 100% even on error so the UI doesn't look stuck
      setUploadProgress(100);
      setIsUploading(false);
      
      if (onUploadError) {
        onUploadError(err.message || 'Failed to save image URL');
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      console.log("File dropped:", droppedFile.name, droppedFile.type, droppedFile.size);
      
      // Check file type
      if (!droppedFile.type.startsWith('image/')) {
        setError('Please select an image file (JPG, PNG, etc.)');
        return;
      }
      
      // Check file size (max 5MB)
      if (droppedFile.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit');
        return;
      }
      
      setFile(droppedFile);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(droppedFile);
    }
  };

  // Completed state UI
  if (uploadCompleted) {
    return (
      <div className="text-center py-8">
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-green-900/20 border border-green-800/30' : 'bg-green-100 border border-green-200'}`}>
          <svg className="mx-auto h-12 w-12 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h3 className="text-xl font-medium mb-2">Payment Proof Uploaded!</h3>
          <p className="text-sm opacity-80">
            We've received your payment proof. Your order is now being processed.
          </p>
          <p className="text-sm opacity-80 mt-2">
            You can view your order status in your account dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className={`text-lg font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
        Upload Payment Proof
      </h3>
      
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}
      
      {/* Toggle between upload and URL input */}
      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className={`text-sm ${isDarkMode ? 'text-accent' : 'text-accent'} hover:underline`}
        >
          {showUrlInput ? 'Upload Image Instead' : 'Use Image URL Instead'}
        </button>
      </div>
      
      {showUrlInput ? (
        <div className="space-y-3">
          <input
            type="text"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="Enter image URL (https://...)"
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-surface-dark border-white/10 text-textLight' 
                : 'bg-white border-gray-300 text-textDark'
            } focus:outline-none focus:ring-1 focus:ring-accent`}
          />
          
          <button
            type="button"
            onClick={handleUrlSubmit}
            disabled={isUploading || !externalUrl}
            className={`w-full py-2 px-4 rounded-lg ${
              isDarkMode 
                ? 'bg-accent text-white hover:bg-accent/90' 
                : 'bg-accent text-white hover:bg-accent/90'
            } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50`}
          >
            {isUploading ? (
              <div className="flex items-center justify-center">
                <div className="mr-2">Saving... {uploadProgress}%</div>
                <div className="w-24 h-1 rounded-full bg-white/20">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-300 ease-in-out" 
                    style={{width: `${uploadProgress}%`}}
                  ></div>
                </div>
              </div>
            ) : (
              'Save Image URL'
            )}
          </button>
        </div>
      ) : preview ? (
        <div className="space-y-3">
          <div className="relative">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-60 rounded-lg object-contain bg-gray-900/20 w-full"
            />
            
            <button
              type="button"
              onClick={handleRemoveFile}
              className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 focus:outline-none"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className={`w-full py-2 px-4 rounded-lg ${
              isDarkMode 
                ? 'bg-accent text-white hover:bg-accent/90' 
                : 'bg-accent text-white hover:bg-accent/90'
            } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50`}
          >
            {isUploading ? (
              <div className="flex items-center justify-center">
                <div className="mr-2">Uploading... {uploadProgress}%</div>
                <div className="w-24 h-1 rounded-full bg-white/20">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-300 ease-in-out" 
                    style={{width: `${uploadProgress}%`}}
                  ></div>
                </div>
              </div>
            ) : (
              'Upload Image'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <label
            htmlFor="file-upload"
            className={`block w-full p-6 border-2 border-dashed rounded-lg cursor-pointer text-center ${
              isDarkMode 
                ? 'border-white/20 hover:border-white/30 bg-white/5' 
                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H0m32-12h0M16 8V4a4 4 0 014-4h4"></path>
              </svg>
              <div className="flex text-sm text-gray-600 justify-center">
                <span className="relative rounded-md font-medium text-accent hover:text-accent/80 focus:outline-none focus:underline">
                  Upload a file
                </span>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
            <input 
              id="file-upload" 
              name="file-upload" 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="sr-only" 
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default PaymentProofUpload; 