import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="py-12 md:py-24 flex flex-col items-center text-center">
        <div className="inline-block mb-6 px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          Learn to code through interactive challenges
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Master Coding with KodeLab
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl">
          Improve your programming skills through hands-on practice, real-time feedback, and a supportive community.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/challenges" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg">
            Start Coding
          </Link>
          <Link href="/curriculum" className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg">
            Explore Curriculum
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          Everything You Need to Grow as a Developer
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-blue-600 font-bold">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Languages Section */}
      <section className="py-16 md:py-24 bg-gray-50 rounded-2xl p-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Multiple Languages Supported
        </h2>
        <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
          Practice in your preferred programming language with our versatile platform
        </p>
        <div className="flex flex-wrap justify-center gap-8">
          {languages.map((lang, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-20 h-20 flex items-center justify-center bg-white rounded-full shadow-md mb-3">
                <span className="text-3xl">{lang.icon}</span>
              </div>
              <span className="font-medium">{lang.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          What Our Users Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold mr-4">
                  {testimonial.initials}
                </div>
                <div>
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.title}</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Level Up Your Coding Skills?
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join thousands of developers who are improving their skills and building their future with KodeLab.
        </p>
        <Link href="/challenges" className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg inline-block">
          Get Started Now
        </Link>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// Sample data for the page
const features = [
  {
    icon: '💻',
    title: 'Interactive Code Editor',
    description: 'Write, run, and test your code directly in the browser with our powerful editor supporting multiple languages.'
  },
  {
    icon: '📊',
    title: 'Detailed Analytics',
    description: 'Track your progress with comprehensive analytics and visualizations of your coding journey.'
  },
  {
    icon: '🏆',
    title: 'Leaderboard System',
    description: 'Compete with other developers and see where you stand in global and category-specific rankings.'
  },
  {
    icon: '💬',
    title: 'Community Forum',
    description: 'Connect with fellow developers, ask questions, and share your knowledge in our supportive community.'
  },
  {
    icon: '📚',
    title: 'Structured Curriculum',
    description: 'Follow a progressive learning path designed to take you from beginner to expert in various programming domains.'
  },
  {
    icon: '🔍',
    title: 'Code Reviews',
    description: 'Get personalized feedback on your code from experienced developers and AI-powered analysis.'
  },
];

const languages = [
  { name: 'JavaScript', icon: 'JS' },
  { name: 'Python', icon: 'PY' },
  { name: 'Java', icon: 'JV' },
  { name: 'C++', icon: 'C++' },
  { name: 'Rust', icon: 'RS' },
];

const testimonials = [
  {
    name: 'Alex Johnson',
    initials: 'AJ',
    title: 'Frontend Developer',
    quote: 'KodeLab helped me prepare for technical interviews and land my dream job. The interactive challenges are perfect for hands-on learning.'
  },
  {
    name: 'Sarah Chen',
    initials: 'SC',
    title: 'Computer Science Student',
    quote: 'As a CS student, KodeLab has been invaluable for reinforcing concepts I learn in class with practical coding exercises.'
  },
  {
    name: 'Michael Rodriguez',
    initials: 'MR',
    title: 'Senior Software Engineer',
    quote: 'Even as an experienced developer, I find KodeLab challenges helpful for keeping my skills sharp and learning new programming languages.'
  },
];

const stats = [
  { value: '500+', label: 'Coding Challenges' },
  { value: '50K+', label: 'Active Users' },
  { value: '5', label: 'Programming Languages' },
  { value: '95%', label: 'Success Rate' },
];
