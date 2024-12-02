import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Offers',
  description: 'Manage your offers',
}

export default function OffersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

