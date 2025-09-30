import { LandingHero } from "../components/landing/hero";
import { Personas } from "../components/landing/personas";
import { ValueProps } from "../components/landing/value-props";
import { SiteFooter } from "../components/layout/footer";

export default function HomePage() {
  return (
    <div id="main-content">
      <LandingHero />
      <ValueProps />
      <Personas />
      <SiteFooter />
    </div>
  );
}
