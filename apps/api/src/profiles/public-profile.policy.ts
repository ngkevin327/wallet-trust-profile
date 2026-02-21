import { NotFoundException } from "@nestjs/common";
import { ProfileVisibility } from "@prisma/client";

type ReadableProfile = {
  visibility: ProfileVisibility;
} | null;

export function assertPublicReadable(
  profile: ReadableProfile,
): asserts profile is NonNullable<ReadableProfile> {
  if (!profile || profile.visibility === ProfileVisibility.private) {
    throw new NotFoundException("Profile not found");
  }
}
