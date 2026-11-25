import { CuratedExhibition, exhibitionMetadata } from '@/components/photography/CuratedExhibition'

export const metadata = exhibitionMetadata('bangkok')

export default function Page() {
  return <CuratedExhibition collectionId="bangkok" />
}
