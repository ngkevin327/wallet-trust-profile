import { notFound } from "next/navigation";
import { PublicProfileLayout } from "../../../components/public/public-profile-layout";
import { fetchPublicProfile } from "../../../lib/api/public-profile";

type PageProps = {
  params: { slug: string };
};

export default async function PublicProfilePage({ params }: PageProps) {
  const slug = params.slug.toLowerCase();
  const profile = await fetchPublicProfile(slug);

  if (!profile) {
    notFound();
  }

  return (
    <PublicProfileLayout profile={profile}>
      <p className="text-sm text-slate-500">Public on-chain reputation profile</p>
    </PublicProfileLayout>
  );
}
