import { VideosClient } from '@/components/VideosClient';
import { environment } from '@/environment/environment';
import { fetchYouTubeVideos, fetchChannelId } from '@/lib/youtube';
import { Video } from '@/types/youtube';
import { Metadata } from 'next';

// SEO metadata
export const metadata: Metadata = {
    title: 'BeFiler - Tax and NTN Video Tutorials',
    description: 'Explore BeFiler’s video tutorials on tax filing and NTN registration in Pakistan.',
};

export default async function VideosPage() {
    const API_KEY = environment.ytApi;
    if (!API_KEY) {
        return <VideosClient taxFilingVideos={[]} ntnRegistrationVideos={[]} error="API key not configured." />;
    }

    let channelId = process.env.BEFILER_CHANNEL_ID;
    let taxFilingVideos: Video[] = [];
    let ntnRegistrationVideos: Video[] = [];
    let error: string | null = null;

    try {
        // Fetch channel ID if not set
        if (!channelId) {
            channelId = await fetchChannelId(API_KEY, '@Befiler');
            if (!channelId) throw new Error('BeFiler channel not found.');
        }

        // Fetch videos
        console.log(channelId)
        taxFilingVideos = await fetchYouTubeVideos(API_KEY, channelId, 'tax filing');
        ntnRegistrationVideos = await fetchYouTubeVideos(API_KEY, channelId, 'ntn registration');
    } catch (err: any) {
        console.error('Error fetching YouTube videos:', err);
        error = err.message.includes('403')
            ? 'API access denied. Check API key or quota.'
            : err.message.includes('404')
                ? 'Channel or videos not found.'
                : 'Failed to load videos. Please try again later.';
    }

    return <VideosClient taxFilingVideos={taxFilingVideos} ntnRegistrationVideos={ntnRegistrationVideos} error={error} />;
}