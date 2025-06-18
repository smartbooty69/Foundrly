import { defineQuery } from "next-sanity";

export const STARTUPS_QUERY = defineQuery(`*[_type == "startup" && defined(slug.current) && !defined($search) || title match $search || category match $search || author->name match $search] | order(_createdAt desc){
    _id,
    title,
    slug,
    _createdAt,
    author-> {
        name,
        image,
        _id
    },
    image,
    category,
    views,  
    description
}`);

export const STARTUP_BY_ID_QUERY = defineQuery(`*[_type == "startup" && _id == $id][0]{
    _id,
    title,
    slug,
    _createdAt,
    author-> {
        name,
        image,
        _id,
        username,
        bio
    },
    image,
    category,
    views,  
    description,
    pitch
}`);

export const STARTUP_VIEWS_QUERY = defineQuery(`*[_type == "startup" && _id == $id][0]{
    -id, views
}`);