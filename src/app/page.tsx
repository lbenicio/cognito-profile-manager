import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowRight, CheckCircle, Palette, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-background text-foreground">
        <div className="container mx-auto px-4 md:px-8 py-20 md:py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Welcome to Outpost
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Your secure and personalized dashboard. Manage your profile, settings, and more, all in one place.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/profile">Go to Your Profile</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/settings">Account Settings</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-card border-t">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Powerful Features, Simply Managed</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Outpost provides everything you need to keep your account safe and up-to-date.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center p-4">
              <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Profile Management</h3>
              <p className="text-muted-foreground">
                Keep your personal information current with our intuitive editing tools.
              </p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Robust Security</h3>
              <p className="text-muted-foreground">
                Enable two-factor authentication with passkeys and OTP for ironclad security.
              </p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
                 <Palette className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized Experience</h3>
              <p className="text-muted-foreground">
                Customize the appearance with light/dark themes and adjustable font sizes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Image Gallery Section */}
       <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-8">
           <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Modern Interface, Seamless Experience</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Built with the latest technology for a fast, responsive, and beautiful user experience.
            </p>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
             <div className="flex justify-center">
                <Image
                  src="https://placehold.co/600x400.png"
                  alt="Screenshot of Outpost profile page"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg"
                  data-ai-hint="dashboard screenshot"
                />
             </div>
             <div className="space-y-4">
                <h3 className="text-2xl font-bold">Your Central Hub</h3>
                <p className="text-muted-foreground">
                  The profile page provides a complete overview of your account status, from verification details to contact information, all cleanly organized in one view.
                </p>
                <Button asChild variant="link" className="px-0">
                  <Link href="/profile">
                    View your profile <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
             </div>
           </div>
        </div>
      </section>
    </>
  );
}
