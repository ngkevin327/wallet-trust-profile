import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicProfileLayout } from "../../../components/public/public-profile-layout";
import { PublicScoreSummary } from "../../../components/public/public-score-summary";
import { VisitorCta } from "../../../components/public/visitor-cta";
import { fetchPublicProfile } from "../../../lib/api/public-profile";
import { profileMetadata } from "../../../lib/seo/metadata";

export const revalidate = 300;

type PageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const profile = await fetchPublicProfile(params.slug.toLowerCase());
  if (!profile) {
    return { title: "Profile not found" };
  }
  return profileMetadata({
    displayName: profile.displayName,
    slug: profile.slug,
    reputationIndex: profile.reputationIndex,
    topBadge: profile.badges[0]?.title ?? null,
  });
}

export default async function PublicProfilePage({ params }: PageProps) {
  const slug = params.slug.toLowerCase();
  const profile = await fetchPublicProfile(slug);

  if (!profile) {
    notFound();
  }

  return (
    <PublicProfileLayout profile={profile} footer={<VisitorCta profileSlug={profile.slug} />}>
      <div className="pb-24">
        <PublicScoreSummary profile={profile} />
      </div>
    </PublicProfileLayout>
  );
}
