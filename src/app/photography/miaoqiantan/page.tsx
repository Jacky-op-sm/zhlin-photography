import { CuratedExhibition, exhibitionMetadata } from '@/components/photography/CuratedExhibition'

export const metadata = exhibitionMetadata('miaoqiantan')

export default function Page() {
  return <CuratedExhibition collectionId="miaoqiantan" />
}
