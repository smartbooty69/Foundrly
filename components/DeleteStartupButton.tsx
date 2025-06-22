"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { deletePitch } from "@/lib/actions";

interface DeleteStartupButtonProps {
  startupId: string;
  startupTitle: string;
  userId: string;
}

const DeleteStartupButton = ({ startupId, startupTitle, userId }: DeleteStartupButtonProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${startupTitle}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    
    try {
      const result = await deletePitch(startupId);
      
      if (result.status === "SUCCESS") {
        toast({
          title: "Success",
          description: "Startup deleted successfully",
        });
        
        // Redirect to user profile page
        router.push(`/user/${userId}`);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete startup",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      onClick={handleDelete}
      disabled={isDeleting}
      className="delete-btn"
    >
      <Trash2 className="h-4 w-4" />
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  );
};

export default DeleteStartupButton; 