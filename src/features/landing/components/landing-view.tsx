import { LandingCalculator } from '@/features/landing/components/landing-calculator'
import { LandingCta } from '@/features/landing/components/landing-cta'
import { LandingFaq } from '@/features/landing/components/landing-faq'
import { LandingFeatures } from '@/features/landing/components/landing-features'
import { LandingFooter } from '@/features/landing/components/landing-footer'
import { LandingGroupCollaboration } from '@/features/landing/components/landing-group-collaboration'
import { LandingHeader } from '@/features/landing/components/landing-header'
import { LandingHero } from '@/features/landing/components/landing-hero'
import { LandingMultiAsset } from '@/features/landing/components/landing-multi-asset'
import { LandingOfflineFirst } from '@/features/landing/components/landing-offline-first'
import { LandingPreviewMockup } from '@/features/landing/components/landing-preview-mockup'

export function LandingView() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-[#090D16] dark:text-slate-100">
            <LandingHeader />
            <main>
                <LandingHero />
                <LandingPreviewMockup />
                <LandingFeatures />
                <LandingMultiAsset />
                <LandingGroupCollaboration />
                <LandingOfflineFirst />
                <LandingCalculator />
                <LandingFaq />
                <LandingCta />
            </main>
            <LandingFooter />
        </div>
    )
}
