
import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: 'xdcfohh8',
  dataset: 'production',
  apiVersion: '2026-08-16',
  useCdn: true,
})
