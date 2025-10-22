import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicProfileLayout } from "../../../components/public/public-profile-layout";
import { PublicScoreSummary } from "../../../components/public/public-score-summary";
import { ProfileFooter } from "../../../components/profile/profile-footer";
import { VisitorCta } from "../../../components/public/visitor-cta";
import { fetchPublicProfile } from "../../../lib/api/public-profile";
import { profileMetadata } from "../../../lib/seo/metadata";
import { isValidPublicSlug } from "../../../lib/slug";

export const revalidate = 300;

type PageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (!isValidPublicSlug(params.slug)) {
    return { title: "Profile not found" };
  }
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

function logInvalidSlugAttempt(raw: string): void {
  if (process.env.NODE_ENV === "development") {
    console.debug("[public-profile] invalid slug rejected before API", { slug: raw });
  }
}

export default async function PublicProfilePage({ params }: PageProps) {
  const rawSlug = params.slug;

  if (!isValidPublicSlug(rawSlug)) {
    logInvalidSlugAttempt(rawSlug);
    notFound();
  }

  const slug = rawSlug.toLowerCase();
  const profile = await fetchPublicProfile(slug);

  if (!profile) {
    notFound();
  }

  const hideFooter = profile.status === "failed";

  return (
    <PublicProfileLayout profile={profile} footer={<VisitorCta profileSlug={profile.slug} />}>
      <div className="pb-24">
        <PublicScoreSummary profile={profile} />
        <ProfileFooter
          scoringVersion={profile.scoringVersion}
          lastUpdated={profile.lastUpdated}
          lastUpdatedAt={profile.lastUpdatedAt}
          hideWhenIndexingFailed={hideFooter}
        />
      </div>
    </PublicProfileLayout>
  );
}
