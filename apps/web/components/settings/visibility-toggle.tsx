"use client";

type Props = {
  value: "public" | "private";
  onChange: (value: "public" | "private") => void;
};

export function VisibilityToggle({ value, onChange }: Props) {
  function handleChange(next: "public" | "private") {
    if (value === "public" && next === "private") {
      if (!window.confirm("Private profiles are hidden from public URLs. Continue?")) {
        return;
      }
    }
    onChange(next);
  }

  return (
    <fieldset>
      <legend className="text-sm font-medium text-slate-700">Profile visibility</legend>
      <div className="mt-2 space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="visibility"
            checked={value === "public"}
            onChange={() => handleChange("public")}
          />
          Public — visible at /u/your-slug
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="visibility"
            checked={value === "private"}
            onChange={() => handleChange("private")}
          />
          Private — returns 404 on public routes
        </label>
      </div>
      <a href="/faq" className="mt-2 inline-block text-xs text-brand-700 hover:underline">
        Learn more in FAQ
      </a>
    </fieldset>
  );
}
