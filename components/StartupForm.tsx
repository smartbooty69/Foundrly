"use client";

import React, { useState, useActionState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Send, Upload, Link as LinkIcon, AlertTriangle } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { FileInput } from "./ui/file-input";
import { formSchema } from "@/lib/validation";
import { createPitch } from "@/lib/actions";
import { uploadImage } from "@/lib/upload";
import { BanCheckWrapper } from "@/components/BanCheckWrapper";

const StartupFormContent = ({ isBanned, banMessage, banLoading }: { 
  isBanned: boolean; 
  banMessage: string; 
  banLoading: boolean; 
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [pitch, setPitch] = useState("");
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [imageInputType, setImageInputType] = useState<"url" | "upload">("url");
  const { toast } = useToast();
  const router = useRouter();

  const handleFileSelect = async (file: File | null) => {
    setSelectedFile(file);
    setUploadedImageUrl("");
    
    if (file) {
      setIsUploading(true);
      try {
        const result = await uploadImage(file);
        if (result.success && result.url) {
          setUploadedImageUrl(result.url);
          toast({
            title: "Success",
            description: "Image uploaded successfully",
          });
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to upload image",
            variant: "destructive",
          });
          setSelectedFile(null);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive",
        });
        setSelectedFile(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleFormSubmit = async (prevState: any, formData: FormData) => {
    try {
      const formValues = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        link: imageInputType === "url" ? (formData.get("link") as string) : "",
        pitch,
        imageFile: selectedFile,
        buyMeACoffeeUsername: formData.get("buyMeACoffeeUsername") as string,
      };
      console.log("[StartupForm] Submitting form with values:", formValues);

      await formSchema.parseAsync(formValues);

      // Use uploaded image URL if available, otherwise use the link
      const finalImageUrl = uploadedImageUrl || formValues.link;
      
      // Create a new FormData with the final image URL
      const finalFormData = new FormData();
      finalFormData.append("title", formValues.title);
      finalFormData.append("description", formValues.description);
      finalFormData.append("category", formValues.category);
      finalFormData.append("link", finalImageUrl);
      finalFormData.append("pitch", pitch);
      finalFormData.append("buyMeACoffeeUsername", formValues.buyMeACoffeeUsername || "");

      console.log("[StartupForm] Final FormData for submission:", Object.fromEntries(finalFormData.entries()));
      const result = await createPitch(prevState, finalFormData, pitch);
      console.log("[StartupForm] Submission result:", result);

      if (result.status == "SUCCESS") {
        toast({
          title: "Success",
          description: "Your startup pitch has been created successfully",
        });

        router.push(`/startup/${result._id}`);
      }

      return result;
    } catch (error) {
      console.error("[StartupForm] Submission error:", error);
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        toast({
          title: "Error",
          description: "Failed to create startup pitch",
          variant: "destructive",
        });
      }
      return { status: "ERROR", message: "Validation failed" };
    }
  };

  const [isPending, formAction] = useActionState(handleFormSubmit, null);

  // Show ban message if user is banned
  if (isBanned) {
    return (
      <div className="startup-form">
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <div>
            <h3 className="font-semibold text-red-800">Account Restricted</h3>
            <p className="text-red-600 text-sm">{banMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="startup-form">
      <div>
        <label htmlFor="title" className="startup-form_label">
          Title
        </label>
        <Input
          id="title"
          name="title"
          className="startup-form_input"
          required
          placeholder="Startup Title"
          disabled={banLoading}
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        {errors.title && <p className="startup-form_error">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="description" className="startup-form_label">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          className="startup-form_textarea"
          required
          placeholder="Startup Description"
          disabled={banLoading}
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        {errors.description && (
          <p className="startup-form_error">{errors.description}</p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="startup-form_label">
          Category
        </label>
        <Input
          id="category"
          name="category"
          className="startup-form_input"
          required
          placeholder="Startup Category (Tech, Health, Education...)"
          disabled={banLoading}
          value={category}
          onChange={e => setCategory(e.target.value)}
        />
        {errors.category && (
          <p className="startup-form_error">{errors.category}</p>
        )}
      </div>

      <div>
        <label htmlFor="buyMeACoffeeUsername" className="startup-form_label">
          Buy me a coffee username (optional)
        </label>
        <Input
          id="buyMeACoffeeUsername"
          name="buyMeACoffeeUsername"
          className="startup-form_input"
          placeholder="Your Buy me a coffee username"
          disabled={banLoading}
        />
        <p className="text-sm text-gray-500 mt-1">
          If you have a Buy me a coffee account, enter your username to receive support
        </p>

        {errors.buyMeACoffeeUsername && (
          <p className="startup-form_error">{errors.buyMeACoffeeUsername}</p>
        )}
      </div>

      <div>
        <label className="startup-form_label">
          Startup Image
        </label>
        
        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant={imageInputType === "url" ? "default" : "outline"}
            size="sm"
            onClick={() => setImageInputType("url")}
            className="flex items-center gap-2"
            disabled={banLoading}
          >
            <LinkIcon className="h-4 w-4" />
            Image URL
          </Button>
          <Button
            type="button"
            variant={imageInputType === "upload" ? "default" : "outline"}
            size="sm"
            onClick={() => setImageInputType("upload")}
            className="flex items-center gap-2"
            disabled={banLoading}
          >
            <Upload className="h-4 w-4" />
            Upload Image
          </Button>
        </div>

        {imageInputType === "url" ? (
          <Input
            id="link"
            name="link"
            className="startup-form_input"
            placeholder="Startup Image URL"
            disabled={banLoading}
          />
        ) : (
          <FileInput
            onFileSelect={handleFileSelect}
            disabled={isUploading || banLoading}
            maxSize={5}
          />
        )}

        {errors.link && <p className="startup-form_error">{errors.link}</p>}
      </div>

      <div data-color-mode="light">
        <div className="flex items-center gap-2 mb-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={async () => {
              setAiLoading(true);
              setAiError(null);
              try {
                console.log("[StartupForm] AI Pitch Generation Triggered", { title, description, category });
                if (!title || !description) {
                  setAiError("Please fill in both title and description fields.");
                  setAiLoading(false);
                  return;
                }
                const response = await fetch("/api/ai/generate-content", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ title, description, category }),
                });
                const data = await response.json();
                console.log("[StartupForm] AI Response:", data);
                if (!response.ok || !data.success) throw new Error(data.message || "AI generation failed");
                setPitch(data.content.pitch || "");
                toast({ title: "AI Pitch Generated", description: "You can edit or submit this pitch." });
              } catch (err: any) {
                console.error("[StartupForm] AI Pitch Generation Error:", err);
                setAiError(err.message || "Failed to generate pitch");
              } finally {
                setAiLoading(false);
              }
            }}
            disabled={aiLoading || banLoading}
          >
            {aiLoading ? "Generating..." : "Generate Pitch with AI"}
          </Button>
          <span className="text-xs text-gray-500">or write your own pitch below</span>
        </div>
        {aiError && <p className="startup-form_error">{aiError}</p>}
        <label htmlFor="pitch" className="startup-form_label">
          Pitch
        </label>

        <MDEditor
          value={pitch}
          onChange={(value) => setPitch(value as string)}
          id="pitch"
          preview="edit"
          height={300}
          style={{ borderRadius: 20, overflow: "hidden" }}
          textareaProps={{
            placeholder:
              "Briefly describe your idea and what problem it solves",
            disabled: banLoading,
          }}
          previewOptions={{
            disallowedElements: ["style"],
          }}
        />

        {errors.pitch && <p className="startup-form_error">{errors.pitch}</p>}
      </div>

      <Button
        type="submit"
        className="startup-form_btn text-white"
        disabled={isPending || isUploading || banLoading}
      >
        {isPending ? "Submitting..." : isUploading ? "Uploading..." : banLoading ? "Checking..." : "Submit Your Pitch"}
        <Send className="size-6 ml-2" />
      </Button>
    </form>
  );
};

const StartupForm = () => {
  return (
    <BanCheckWrapper>
      {({ isBanned, banMessage, isLoading: banLoading }) => (
        <StartupFormContent 
          isBanned={isBanned} 
          banMessage={banMessage} 
          banLoading={banLoading} 
        />
      )}
    </BanCheckWrapper>
  );
};

export default StartupForm;