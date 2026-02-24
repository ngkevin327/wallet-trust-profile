import Link from "next/link";

type Props = {
  feature: string;
};

export function UpgradePrompt({ feature }: Props) {
  return (
    <div className="ui-card-highlight text-center">
      <p className="page-eyebrow">Premium feature</p>
      <p className="mt-2 text-sm text-slate-700">{feature} requires a Premium subscription.</p>
      <Link href="/pricing" className="ui-btn ui-btn-primary mt-4 inline-flex">
        View pricing
      </Link>
    </div>
  );
}
