import PlatformsDashboard from '../leetcode/page';

export default function DynamicPlatformPage({ params }: { params: { platform: string } }) {
  return <PlatformsDashboard params={params} />;
}
