import { CuratedExhibition, exhibitionMetadata } from '@/components/photography/CuratedExhibition'

export const metadata = exhibitionMetadata('works')

export default function Page() {
  return <CuratedExhibition collectionId="works" />
}
