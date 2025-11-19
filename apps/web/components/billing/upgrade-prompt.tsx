import Link from "next/link";

type Props = {
  feature: string;
};

export function UpgradePrompt({ feature }: Props) {
  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50 p-6 text-center">
      <p className="text-sm font-medium text-brand-900">Premium feature</p>
      <p className="mt-2 text-sm text-brand-800">
        {feature} requires a Premium subscription.
      </p>
      <Link href="/pricing" className="ui-btn ui-btn-primary mt-4 inline-flex">
        View pricing
      </Link>
    </div>
  );
}
