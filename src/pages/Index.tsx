import { Link } from 'react-router-dom';
import { EyeOff, Eye, Binary, ArrowRight, Shield, Zap, Volume2 } from 'lucide-react';
import { Layout } from '@/components/Layout';

export default function Index() {
  const features = [
    {
      icon: Shield,
      title: 'LSB Steganography',
      description: 'Hide data in the least significant bits of image pixels, making changes imperceptible to human eyes.'
    },
    {
      icon: Zap,
      title: 'Instant Processing',
      description: 'All encoding and decoding happens locally in your browser with no server uploads required.'
    },
    {
      icon: Volume2,
      title: 'Text-to-Speech',
      description: 'Listen to extracted characters using the built-in Web Speech API for accessibility.'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Binary className="w-4 h-4" />
              Academic Project
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-slide-up">
              <span className="gradient-text">Image Steganography</span>
              <br />
              <span className="text-foreground">Made Simple</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 animate-slide-up">
              Hide secret characters within images using Least Significant Bit (LSB) encoding. 
              A visual demonstration of digital steganography concepts.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
              <Link to="/encode" className="btn-primary w-full sm:w-auto">
                <EyeOff className="w-5 h-5" />
                Encode Message
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/decode" className="btn-secondary w-full sm:w-auto">
                <Eye className="w-5 h-5" />
                Decode Message
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              How It Works
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={feature.title}
                  className="card-elevated p-6 text-center animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Algorithm Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="card-elevated p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">The LSB Algorithm</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <EyeOff className="w-5 h-5 text-primary" />
                    Encoding Process
                  </h3>
                  <ol className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">1</span>
                      <span>Convert image to <strong className="text-foreground">grayscale</strong> and resize to 256×256</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">2</span>
                      <span>Convert character to <strong className="text-foreground">8-bit binary</strong> (ASCII)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">3</span>
                      <span>Replace <strong className="text-foreground">LSB of each pixel</strong> with message bit</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">4</span>
                      <span>Save the modified <strong className="text-foreground">stego image</strong></span>
                    </li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    Decoding Process
                  </h3>
                  <ol className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center">1</span>
                      <span>Load the <strong className="text-foreground">stego image</strong></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center">2</span>
                      <span>Extract <strong className="text-foreground">LSB from first 8 pixels</strong></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center">3</span>
                      <span>Combine bits to form <strong className="text-foreground">8-bit binary</strong></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center">4</span>
                      <span>Convert binary to <strong className="text-foreground">ASCII character</strong></span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
