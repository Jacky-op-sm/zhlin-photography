import { CuratedExhibition, exhibitionMetadata } from '@/components/photography/CuratedExhibition'

export const metadata = exhibitionMetadata('intersection')

export default function Page() {
  return <CuratedExhibition collectionId="intersection" />
}
