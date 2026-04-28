import { CampaignRoomClient } from "@/components/CampaignRoomClient";

export default async function CampaignRoomPage({ params }) {
  const { id } = await params;
  return <CampaignRoomClient campaignId={id} />;
}
