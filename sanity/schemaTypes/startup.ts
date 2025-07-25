import { defineField, defineType } from "sanity";
import { UserIcon } from "lucide-react";

export const startup = defineType({
    name: "startup",
    title: "Startup",
    type: "document",
    icon: UserIcon,
    fields: [
        defineField({
            name: "title",
            type: "string",
        }),
        defineField({
            name: "slug",
            type: "slug",
            options: {
                source: "title"
            }
        }),
        defineField({
            name: "author",
            type: "reference",
            to: { type: "author" }
        }),
        defineField({
            name: "views",
            type: "number",
        }),
        defineField({
            name: "description",
            type: "text",
        }),
        defineField({
            name: "category",
            type: "string",
            validation: (Rule) => Rule.min(1).max(20).required().error("Category is required"),
        }),
        defineField({
            name: "image",
            type: "url",
            validation: (Rule) => Rule.required().error("Image is required"),
        }),
        defineField({
            name: "pitch",
            type: "markdown",
        }),
        defineField({
            name: "likes",
            type: "number",
            initialValue: 0,
        }),
        defineField({
            name: "dislikes",
            type: "number",
            initialValue: 0,
        }),
        defineField({
            name: "likedBy",
            type: "array",
            of: [{ type: "string" }],
            initialValue: [],
        }),
        defineField({
            name: "dislikedBy",
            type: "array",
            of: [{ type: "string" }],
            initialValue: [],
        }),
        defineField({
            name: "comments",
            type: "array",
            of: [{ type: "reference", to: [{ type: "comment" }] }],
            initialValue: [],
        }),
    ],
});