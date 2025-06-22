import { cn, formatDate } from "@/lib/utils";
import { EyeIcon, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Author, Startup } from "@/sanity/types";
import { Skeleton } from "@/components/ui/skeleton";
import DeleteStartupButton from "./DeleteStartupButton";

export type StartupTypeCard = Omit<Startup, "author"> & { author?: Author };

interface StartupCardProps {
  post: StartupTypeCard;
  isOwner?: boolean;
}

const StartupCard = ({ post, isOwner = false }: StartupCardProps) => {
  const {
    _createdAt,
    views,
    author,
    title,
    category,
    _id,
    image,
    description,
  } = post;

  return (
    <li className="startup-card group">
      <div className="flex-between">
        <p className="startup_card_date">{formatDate(_createdAt)}</p>
        <div className="flex gap-1.5">
          <EyeIcon className="size-6 text-primary" />
          <span className="text-16-medium">{views}</span>
        </div>
      </div>

      <div className="flex-between mt-5 gap-5">
        <div className="flex-1">
          <Link href={`/user/${author?._id}`}>
            <p className="text-16-medium line-clamp-1">{author?.name}</p>
          </Link>
          <Link href={`/startup/${_id}`}>
            <h3 className="text-26-semibold line-clamp-1">{title}</h3>
          </Link>
        </div>
        <Link href={`/user/${author?._id}`}>
          <Image
            src={author?.image!}
            alt={author?.name!}
            width={48}
            height={48}
            className="rounded-full"
          />
        </Link>
      </div>

      <Link href={`/startup/${_id}`}>
        <p className="startup-card_desc">{description}</p>

        <img src={image} alt="placeholder" className="startup-card_img" />
      </Link>

      <div className="flex-between gap-3 mt-5">
        <Link href={`/?query=${category?.toLowerCase()}`}>
          <p className="text-16-medium truncate max-w-xs whitespace-nowrap">{category}</p>
        </Link>
        <div className="action-buttons">
          <Button className="startup-card_btn" asChild>
            <Link href={`/startup/${_id}`}>Details</Link>
          </Button>
          
          {isOwner && (
            <div className="flex gap-2">
              <Button className="edit-btn p-2 h-9 w-9" asChild>
                <Link href={`/startup/${_id}/edit`} aria-label="Edit">
                  <Edit className="h-5 w-5" />
                </Link>
              </Button>
              <DeleteStartupButton 
                startupId={_id} 
                startupTitle={title || ""} 
                userId={author?._id || ""}
                iconOnly
              />
            </div>
          )}
        </div>
      </div>
    </li>
  );
};

export const StartupCardSkeleton = () => (
  <>
    {[0, 1, 2, 3, 4].map((index: number) => (
      <li key={cn("skeleton", index)}>
        <Skeleton className="startup-card_skeleton" />
      </li>
    ))}
  </>
);

export default StartupCard;