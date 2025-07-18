import { defineQuery } from "next-sanity";

export const STARTUPS_QUERY =
  defineQuery(`*[_type == "startup" && defined(slug.current) && !defined($search) || title match $search || category match $search || author->name match $search] | order(_createdAt desc) {
  _id, 
  title, 
  slug,
  _createdAt,
  author -> {
    _id, name, image, bio
  }, 
  views,
  description,
  category,
  image,
}`);

export const STARTUP_BY_ID_QUERY =
  defineQuery(`*[_type == "startup" && _id == $id][0]{
  _id, 
  title, 
  slug,
  _createdAt,
  author -> {
    _id, name, username, image, bio
  }, 
  views,
  description,
  category,
  image,
  pitch,
}`);

export const STARTUP_VIEWS_QUERY = defineQuery(`
    *[_type == "startup" && _id == $id][0]{
        _id, views
    }
`);

export const AUTHOR_BY_GITHUB_ID_QUERY = defineQuery(`
*[_type == "author" && id == $id][0]{
    _id,
    id,
    name,
    username,
    email,
    image,
    bio,
    followers[]->{ _id, name, username, image },
    following[]->{ _id, name, username, image }
}
`);

export const AUTHOR_BY_ID_QUERY = defineQuery(`
*[_type == "author" && _id == $id][0]{
    _id,
    id,
    name,
    username,
    email,
    image,
    bio,
    followers[]->{ _id, name, username, image },
    following[]->{ _id, name, username, image }
}
`);

export const AUTHOR_FOLLOWERS_FOLLOWING_QUERY = defineQuery(`
*[_type == "author" && _id == $id][0]{
    _id,
    followers,
    following
}
`);

export const STARTUPS_BY_AUTHOR_QUERY =
  defineQuery(`*[_type == "startup" && author._ref == $id] | order(_createdAt desc) {
  _id, 
  title, 
  slug,
  _createdAt,
  author -> {
    _id, name, image, bio
  }, 
  views,
  description,
  category,
  image,
}`);

export const PLAYLIST_BY_SLUG_QUERY =
  defineQuery(`*[_type == "playlist" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  select[]->{
    _id,
    _createdAt,
    title,
    slug,
    author->{
      _id,
      name,
      slug,
      image,
      bio
    },
    views,
    description,
    category,
    image,
    pitch
  }
}`);

export const SUGGESTED_USERS_QUERY = defineQuery(`
*[_type == "author" && _id != $currentUserId && !($currentUserFollowing[] match _id)] | order(_createdAt desc)[0...15]{
    _id,
    id,
    name,
    username,
    email,
    image,
    bio,
    followers[]->{ _id, name, username, image },
    following[]->{ _id, name, username, image }
}
`);

export const CURRENT_USER_FOLLOWERS_QUERY = defineQuery(`
*[_type == "author" && _id == $currentUserId][0]{
    followers[]->{ _id, name, username, image, bio },
    following[]->{ _id, name, username, image, bio }
}
`);

export const ALL_USERS_QUERY = defineQuery(`
*[_type == "author"] | order(_createdAt desc)[0...50]{
    _id,
    id,
    name,
    username,
    email,
    image,
    bio,
    followers[]->{ _id, name, username, image },
    following[]->{ _id, name, username, image }
}
`);