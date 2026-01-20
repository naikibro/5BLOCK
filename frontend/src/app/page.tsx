/**
 * Landing Page
 * Page d'accueil avec redirection si connecté et présentation de la dApp
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MintCarousel } from '@/components/MintCarousel';
import {
  Sparkles,
  Wallet,
  ArrowRightLeft,
  Shield,
  Zap,
  Globe,
  ChevronRight,
} from 'lucide-react';

export default function Home() {
  const { isConnected } = useAccount();
  const router = useRouter();

  // Redirect to catalog if connected
  useEffect(() => {
    if (isConnected) {
      const timer = setTimeout(() => {
        router.push('/catalog');
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isConnected, router]);

  // Show loading or nothing while redirecting
  if (isConnected) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Redirecting to catalog...</p>
          <Link href="/catalog">
            <Button variant="outline" size="sm">
              Continue manually
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-background py-20 sm:py-32">
        <div className="absolute inset-0 bg-[url('/bg-pokemon.jpg')] bg-cover bg-center opacity-5" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Powered by Blockchain Technology</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Collect, Trade & Own
              <br />
              Pokémon NFT Cards
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Enter the world of blockchain-powered Pokémon cards. Mint unique Gen 1 Pokémon, trade with collectors, and build your ultimate collection.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/catalog">
                <Button size="lg" className="w-full sm:w-auto group">
                  Explore Catalog
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Mints Carousel */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <MintCarousel />
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Choose 5BLOCK?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience the future of Pokémon card collecting with blockchain technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">True Ownership</h3>
                <p className="text-muted-foreground">
                  Your cards are stored on the blockchain. You own them forever with cryptographic proof.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                  <ArrowRightLeft className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Peer-to-Peer Trading</h3>
                <p className="text-muted-foreground">
                  Trade directly with other collectors. No intermediaries, just secure blockchain transactions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Unique Cards</h3>
                <p className="text-muted-foreground">
                  Each Pokémon can only be minted once. Rarity is guaranteed by smart contracts.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Instant Minting</h3>
                <p className="text-muted-foreground">
                  Mint your favorite Gen 1 Pokémon in seconds. All 151 original Pokémon available.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">IPFS Storage</h3>
                <p className="text-muted-foreground">
                  Card metadata stored on IPFS ensures your cards are accessible forever.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Wallet className="w-6 h-6 text-indigo-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">MetaMask Compatible</h3>
                <p className="text-muted-foreground">
                  Connect with MetaMask or any Web3 wallet. Simple and secure authentication.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">151</div>
              <div className="text-muted-foreground">Unique Pokémon</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">4</div>
              <div className="text-muted-foreground">Rarity Tiers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">∞</div>
              <div className="text-muted-foreground">Trade Possibilities</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">10min</div>
              <div className="text-muted-foreground">Lock Duration</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-primary/20">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Start Your Collection?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Connect your wallet and mint your first Pokémon card today. Join the community of blockchain collectors!
              </p>
              <Button size="lg" className="group">
                <Wallet className="w-5 h-5 mr-2" />
                Connect Wallet to Get Started
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
