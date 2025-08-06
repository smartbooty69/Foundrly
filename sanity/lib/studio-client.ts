import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId, token } from '../env'

export const studioClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
})

export const studioReadClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
}) 