import { AppShell } from '../components/app/AppShell';
import { HomeFeed } from '../components/home/HomeFeed';
import { HomeHeader } from '../components/home/HomeHeader';
import { SchoolPanel } from '../components/home/SchoolPanel';
import { SummaryCards } from '../components/home/SummaryCards';

export function PlatformHome() {
  return (
    <AppShell>
      <div className="space-y-5 lg:space-y-6">
        <HomeHeader />
        <SummaryCards />
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_20rem] lg:grid-cols-[minmax(0,1fr)_19rem] xl:grid-cols-[minmax(0,1fr)_21rem]">
          <HomeFeed />
          <SchoolPanel />
        </div>
      </div>
    </AppShell>
  );
}
