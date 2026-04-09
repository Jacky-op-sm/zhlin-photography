import { redirect } from 'next/navigation'

export default function PetsPage() {
  redirect('/photography?category=pets')
}
