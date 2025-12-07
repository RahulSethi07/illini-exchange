import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, MapPin, Users, ArrowRight, Search, 
  BookOpen, Laptop, Sofa, Ticket, Bike, CheckCircle 
} from 'lucide-react';

const Landing = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Shield,
      title: 'Verified Illini Only',
      description: 'Every user is verified with their @illinois.edu email. No anonymous scammers here.'
    },
    {
      icon: MapPin,
      title: 'Safe Exchange Points',
      description: 'Meet at pre-defined safe locations on campus like the Illini Union or UGL.'
    },
    {
      icon: Users,
      title: 'Campus Community',
      description: 'Connect with fellow students and staff. Trade textbooks, furniture, and more.'
    }
  ];

  const categories = [
    { icon: BookOpen, name: 'Textbooks', count: '500+', color: 'bg-blue-500' },
    { icon: Laptop, name: 'Electronics', count: '300+', color: 'bg-purple-500' },
    { icon: Sofa, name: 'Furniture', count: '200+', color: 'bg-green-500' },
    { icon: Ticket, name: 'Event Tickets', count: '100+', color: 'bg-pink-500' },
    { icon: Bike, name: 'Transportation', count: '150+', color: 'bg-orange-500' },
  ];

  const steps = [
    { step: '01', title: 'Sign Up', desc: 'Use your @illinois.edu email to create an account' },
    { step: '02', title: 'List or Browse', desc: 'Post items to sell or find what you need' },
    { step: '03', title: 'Connect', desc: 'Contact sellers directly via email' },
    { step: '04', title: 'Exchange Safely', desc: 'Meet at a campus Safe Exchange Point' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-illini-blue via-illini-blue to-illini-blue-light">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 pattern-grid"></div>
        </div>
        
        {/* Decorative shapes */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-illini-orange/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-illini-orange/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/90 text-sm mb-6">
                <Shield size={16} className="text-illini-orange" />
                Exclusive to UIUC Students & Staff
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight">
                The Safer Way to{' '}
                <span className="text-illini-orange">Buy & Sell</span>{' '}
                on Campus
              </h1>
              
              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
                Skip the sketchy Facebook marketplace posts. Trade textbooks, furniture, 
                and more with verified Illini at safe campus locations.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/marketplace" className="btn-primary text-lg px-8 py-3 flex items-center justify-center gap-2">
                  Browse Marketplace
                  <ArrowRight size={20} />
                </Link>
                {!isAuthenticated && (
                  <Link to="/register" className="btn-outline bg-transparent border-white text-white hover:bg-white hover:text-illini-blue text-lg px-8 py-3">
                    Get Started Free
                  </Link>
                )}
              </div>

              {/* Trust indicators */}
              <div className="flex items-center justify-center lg:justify-start gap-6 mt-10 pt-8 border-t border-white/10">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">1000+</div>
                  <div className="text-sm text-gray-400">Active Listings</div>
                </div>
                <div className="w-px h-10 bg-white/20"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">5000+</div>
                  <div className="text-sm text-gray-400">Verified Users</div>
                </div>
                <div className="w-px h-10 bg-white/20"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">10</div>
                  <div className="text-sm text-gray-400">Safe Zones</div>
                </div>
              </div>
            </div>

            {/* Hero illustration/card */}
            <div className="hidden lg:block relative animate-slide-up">
              <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-auto transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="absolute -top-3 -right-3 bg-illini-orange text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Just Listed
                </div>
                <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-6xl">📚</span>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-2xl font-bold text-illini-orange">$45</span>
                  <span className="badge-green">Like New</span>
                </div>
                <h3 className="font-semibold text-illini-blue mb-2">Calculus Textbook - Stewart 8th Ed</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={14} className="text-illini-orange" />
                  Grainger Engineering Library
                </div>
              </div>
              
              {/* Floating badges */}
              <div className="absolute -left-8 top-1/4 bg-white rounded-lg shadow-lg p-3 animate-pulse-slow">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={20} />
                  <span className="text-sm font-medium">Verified Seller</span>
                </div>
              </div>
              
              <div className="absolute -right-4 bottom-1/4 bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="text-illini-orange" size={20} />
                  <span className="text-sm font-medium">Safe Meetup</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F8F8F8"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-cloud">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-illini-blue mb-4">
              Why Choose Illini Exchange?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We built this platform specifically for the UIUC community to make 
              buying and selling safer and easier.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="card p-8 text-center hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 bg-illini-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="text-illini-orange" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-illini-blue mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-illini-blue mb-4">
                Popular Categories
              </h2>
              <p className="text-gray-600">Find everything you need for campus life</p>
            </div>
            <Link 
              to="/marketplace" 
              className="text-illini-orange font-semibold flex items-center gap-2 hover:gap-3 transition-all mt-4 md:mt-0"
            >
              View All Categories <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/marketplace?category=${category.name.toLowerCase()}`}
                className="card p-6 text-center group hover:-translate-y-1"
              >
                <div className={`w-14 h-14 ${category.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <category.icon className="text-white" size={28} />
                </div>
                <h3 className="font-semibold text-illini-blue mb-1">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count} items</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-illini-blue relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pattern-dots"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Getting started is easy. Join thousands of Illini already using the platform.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="text-5xl font-display font-bold text-illini-orange/30 mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm">{step.desc}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full">
                    <ArrowRight className="text-illini-orange/30 mx-auto" size={32} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-cloud">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-illini-blue mb-6">
            Ready to Start Trading?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join the Illini Exchange community today and experience a safer way to buy and sell on campus.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/marketplace" className="btn-primary text-lg px-8 py-3">
              Browse Marketplace
            </Link>
            {!isAuthenticated && (
              <Link to="/register" className="btn-secondary text-lg px-8 py-3">
                Create Free Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;

