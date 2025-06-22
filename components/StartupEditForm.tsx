"use client";

import React, { useState, useActionState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Send, Upload, Link as LinkIcon } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { FileInput } from "./ui/file-input";
import { formSchema } from "@/lib/validation";
import { updatePitch } from "@/lib/actions";
import { uploadImage } from "@/lib/upload";
import { StartupTypeCard } from "./StartupCard";

interface StartupEditFormProps {
  startup: StartupTypeCard;
}

const StartupEditForm = ({ startup }: StartupEditFormProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pitch, setPitch] = useState(startup.pitch || "");
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
      };

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

      const result = await updatePitch(prevState, finalFormData, pitch, startup._id);

      if (result.status == "SUCCESS") {
        toast({
          title: "Success",
          description: "Your startup pitch has been updated successfully",
        });

        router.push(`/startup/${startup._id}`);
      }

      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErorrs = error.flatten().fieldErrors;

        setErrors(fieldErorrs as unknown as Record<string, string>);

        toast({
          title: "Error",
          description: "Please check your inputs and try again",
          variant: "destructive",
        });

        return { ...prevState, error: "Validation failed", status: "ERROR" };
      }

      toast({
        title: "Error",
        description: "An unexpected error has occurred",
        variant: "destructive",
      });

      return {
        ...prevState,
        error: "An unexpected error has occurred",
        status: "ERROR",
      };
    }
  };

  const [state, formAction, isPending] = useActionState(handleFormSubmit, {
    error: "",
    status: "INITIAL",
  });

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
          defaultValue={startup.title}
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
          defaultValue={startup.description}
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
          defaultValue={startup.category}
        />

        {errors.category && (
          <p className="startup-form_error">{errors.category}</p>
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
            defaultValue={startup.image}
          />
        ) : (
          <FileInput
            onFileSelect={handleFileSelect}
            disabled={isUploading}
            maxSize={5}
          />
        )}

        {errors.link && <p className="startup-form_error">{errors.link}</p>}
      </div>

      <div>
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
        disabled={isPending || isUploading}
      >
        {isPending ? "Updating..." : isUploading ? "Uploading..." : "Update Your Pitch"}
        <Send className="size-6 ml-2" />
      </Button>
    </form>
  );
};

export default StartupEditForm; 