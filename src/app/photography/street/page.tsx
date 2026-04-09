import { redirect } from 'next/navigation'

export default function StreetPage() {
  redirect('/photography?category=street')
}
