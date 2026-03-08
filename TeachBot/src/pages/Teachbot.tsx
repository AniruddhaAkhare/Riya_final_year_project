import React from 'react';

const Home = () => {
  const handleScroll = (e, targetId) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="font-sans">
      {/* External CSS */}
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css "
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css "
      />

      {/* Enhanced Inline Styles */}
      <style>
        {`
          :root {
            --color-primary: #10a37f;
            --color-secondary: #0c8063;
            --color-dark: #202123;
            --color-light: #f7f7f8;
            --color-gray: #6e6e80;
            --color-bg-light: #f9fbfc;
          }
          body {
            font-family: 'Söhne', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Ubuntu, Cantarell, 'Noto Sans', sans-serif;
            color: var(--color-dark);
            background-color: #ffffff;
            scroll-behavior: smooth;
          }
          .btn-primary {
            background-color: var(--color-primary);
            color: white;
            transition: all 0.3s ease;
            box-shadow: 0 2px 5px rgba(16, 163, 127, 0.2);
          }
          .btn-primary:hover {
            background-color: var(--color-secondary);
            transform: translateY(-1px);
            box-shadow: 0 4px 10px rgba(16, 163, 127, 0.3);
          }
          .btn-outline {
            border: 1.5px solid var(--color-primary);
            color: var(--color-primary);
            background-color: transparent;
            transition: all 0.3s ease;
          }
          .btn-outline:hover {
            background-color: var(--color-primary);
            color: white;
            transform: translateY(-1px);
          }
          .gradient-section {
            background: linear-gradient(to right, #f8fafc, #ffffff);
          }
          .feature-card {
            border-radius: 16px;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.06);
            transition: all 0.4s cubic-bezier(0.2, 0.8, 0.3, 1);
            border: 1px solid #f0f0f0;
          }
          .feature-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 16px 24px rgba(0, 0, 0, 0.12);
          }
          .dashboard-card {
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
            transition: all 0.4s ease;
            background: white;
            border: 1px solid #eaeaea;
          }
          .dashboard-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
          }
          .feature-icon {
            color: var(--color-primary);
            font-size: 2.2rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 60px;
            background: rgba(16, 163, 127, 0.1);
            border-radius: 50%;
          }
          .nav-link {
            color: var(--color-gray);
            font-weight: 500;
            position: relative;
            transition: color 0.3s ease;
          }
          .nav-link:hover {
            color: var(--color-primary);
          }
          .nav-link::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 0;
            width: 0;
            height: 2px;
            background-color: var(--color-primary);
            transition: width 0.3s ease;
          }
          .nav-link:hover::after {
            width: 100%;
          }
          nav a {
            transition: all 0.3s ease-in-out;
          }
          nav a:hover {
            color: var(--color-primary);
            transform: scale(1.05);
          }
          .testimonial-card {
            transition: all 0.4s ease;
          }
          .testimonial-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
          }

          /* How It Works Timeline Styles */
          .timeline-container {
            position: relative;
            max-width: 680px;
            margin: 0 auto;
          }

          /* Vertical Line */
          .timeline-line {
            position: absolute;
            left: 50%;
            top: 0;
            bottom: 0;
            width: 2px;
            background: linear-gradient(to bottom, transparent, var(--color-primary), transparent);
            transform: translateX(-50%);
          }

          .timeline-item {
            display: flex;
            justify-content: flex-end;
            margin: 2rem 0;
            position: relative;
            width: 100%;
            clear: both;
          }

          .timeline-item-left {
            justify-content: flex-end;
          }

          .timeline-item-right {
            justify-content: flex-start;
          }

          .timeline-content {
            width: calc(50% - 40px);
            padding: 1.5rem;
            border-radius: 12px;
            background: white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #eee;
            text-align: right;
          }

          .timeline-content.left {
            text-align: left;
            margin-left: 40px;
          }

          .timeline-content.right {
            text-align: right;
            margin-right: 40px;
          }

          .timeline-step {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: var(--color-primary);
            color: white;
            font-weight: bold;
            font-size: 1.1rem;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            z-index: 10;
          }

          .timeline-step.left {
            left: calc(50% - 80px);
          }

          .timeline-step.right {
            right: calc(50% - 80px);
          }

          .timeline-item h3 {
            font-size: 1.25rem;
            font-weight: bold;
            color: var(--color-dark);
          }

          .timeline-item p {
            font-size: 0.95rem;
            color: var(--color-gray);
            margin-top: 0.5rem;
          }

          @media (max-width: 768px) {
            .timeline-line {
              left: 30px;
            }
            .timeline-item {
              justify-content: flex-start !important;
            }
            .timeline-step {
              left: 30px !important;
              right: auto;
              transform: translateY(-50%);
            }
            .timeline-content {
              width: calc(100% - 80px);
              margin-left: 70px;
              text-align: left !important;
            }
            .timeline-content.right,
            .timeline-content.left {
              margin: 0;
            }
          }
        `}
      </style>

      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: 'var(--color-primary)' }}
            >
              TeachBot
            </h1>
            <div className="hidden md:flex space-x-8">
              {['features', 'how-it-works', 'testimonials', 'dashboards'].map((item) => (
                <a
                  key={item}
                  href={`#${item}`}
                  onClick={(e) => handleScroll(e, item)}
                  className="nav-link capitalize text-sm"
                >
                  {item.replace('-', ' ')}
                </a>
              ))}
            </div>
            <div className="flex space-x-3">
              <a
                href="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                Log In
              </a>
              <a
                href="/signup"
                className="btn-primary px-5 py-2 rounded-lg text-sm font-medium"
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">TeachBot</span>
                  <span
                    className="block text-xl md:text-2xl mt-2"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Your AI-Powered Teaching Assistant
                  </span>
                </h1>
                <p className="mt-4 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Automate grading, deliver personalized feedback, and empower students, teachers, and parents.
                </p>
                <div className="mt-8 sm:mt-12 sm:flex sm:justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
                  <a
                    href="/signup"
                    className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white btn-primary md:py-4 md:text-lg md:px-10"
                  >
                    Get Started Free
                  </a>
                  <a
                    href="#how-it-works"
                    onClick={(e) => handleScroll(e, 'how-it-works')}
                    className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl btn-outline md:py-4 md:text-lg md:px-10"
                  >
                    How It Works
                  </a>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 flex items-center justify-center p-8">
          <img
            className="rounded-2xl shadow-xl w-full max-w-md object-cover md:max-w-lg"
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80"
            alt="Students using TeachBot"
          />
        </div>
      </header>

      {/* Dashboards Section */}
      <section id="dashboards" className="py-16 gradient-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              
            Specialized Dashboards


            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Personalized experiences for students, teachers, and parents.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {/* Student Dashboard */}
            <div className="dashboard-card">
              <div className="p-6 flex flex-col h-full">
                <div className="feature-icon mb-5">
                  <i className="fas fa-user-graduate"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Student Dashboard</h3>
                <ul className="space-y-2 text-gray-700 flex-grow">
                  {[
                    'Track assignments & grades',
                    'Get instant AI feedback',
                    'Follow learning paths',
                    'Submit work easily',
                    'Access resources',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center">
                      <i className="fas fa-check-circle text-green-500 mr-2"></i>
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="/student-dashboard"
                  className="mt-6 btn-primary py-3 px-4 rounded-lg text-center font-medium shadow-sm hover:shadow transition"
                >
                  Explore Dashboard
                </a>
              </div>
            </div>
            {/* Teacher Dashboard */}
            <div className="dashboard-card">
              <div className="p-6 flex flex-col h-full">
                <div className="feature-icon mb-5">
                  <i className="fas fa-chalkboard-teacher"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Teacher Dashboard</h3>
                <ul className="space-y-2 text-gray-700 flex-grow">
                  {[
                    'Monitor class performance',
                    'Review AI evaluations',
                    'Create quizzes & assignments',
                    'View analytics',
                    'Customize learning paths',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center">
                      <i className="fas fa-check-circle text-green-500 mr-2"></i>
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="/teacher-dashboard"
                  className="mt-6 btn-primary py-3 px-4 rounded-lg text-center font-medium shadow-sm hover:shadow transition"
                >
                  Explore Dashboard
                </a>
              </div>
            </div>
            {/* Parent Dashboard */}
            <div className="dashboard-card">
              <div className="p-6 flex flex-col h-full">
                <div className="feature-icon mb-5">
                  <i className="fas fa-users"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Parent Dashboard</h3>
                <ul className="space-y-2 text-gray-700 flex-grow">
                  {[
                    'Track child’s progress',
                    'Receive weekly reports',
                    'Get alerts on missing work',
                    'View teacher feedback',
                    'Schedule parent-teacher meetings',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center">
                      <i className="fas fa-check-circle text-green-500 mr-2"></i>
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="/parent-dashboard"
                  className="mt-6 btn-primary py-3 px-4 rounded-lg text-center font-medium shadow-sm hover:shadow transition"
                >
                  Explore Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Powerful Features for Modern Education
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Our platform combines AI with education to create a seamless learning experience.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: 'fa-robot',
                title: 'AI Grading',
                desc: 'Automated evaluation using NLP and OCR for handwritten answers.',
              },
              {
                icon: 'fa-comments',
                title: 'Personal Feedback',
                desc: 'AI generates detailed suggestions for improvement.',
              },
              {
                icon: 'fa-chart-line',
                title: 'Progress Tracking',
                desc: 'Real-time dashboards for performance monitoring.',
              },
              {
                icon: 'fa-book',
                title: 'Resource Hub',
                desc: 'Access notes, videos, and interactive learning tools.',
              },
              {
                icon: 'fa-calendar-alt',
                title: 'Smart Reminders',
                desc: 'Never miss deadlines with automated notifications.',
              },
              {
                icon: 'fa-graduation-cap',
                title: 'Skill Builder',
                desc: 'AI recommends courses to boost student skills.',
              },
            ].map((feature, index) => (
              <div key={index} className="feature-card p-6 text-center">
                <div className="feature-icon mx-auto mb-4">
                  <i className={`fas ${feature.icon}`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-base text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section - Enhanced */}
      <section id="how-it-works" className="py-16 gradient-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              A simple 4-step process that transforms teaching and learning.
            </p>
          </div>

          <div className="timeline-container">
            {/* Vertical Line */}
            <div className="timeline-line"></div>

            {/* Step 1 */}
            <div className="timeline-item timeline-item-right">
              <div className="timeline-step right">1</div>
              <div className="timeline-content right">
                <h3>Student Submits Assignment</h3>
                <p>Upload assignments in PDF, DOC, or photos of handwritten work.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="timeline-item timeline-item-left">
              <div className="timeline-step left">2</div>
              <div className="timeline-content left">
                <h3>AI Evaluates Work</h3>
                <p>Our system checks accuracy, clarity, and structure using advanced AI.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="timeline-item timeline-item-right">
              <div className="timeline-step right">3</div>
              <div className="timeline-content right">
                <h3>Feedback Generated</h3>
                <p>Personalized comments and improvement tips delivered instantly.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="timeline-item timeline-item-left">
              <div className="timeline-step left">4</div>
              <div className="timeline-content left">
                <h3>Learning Path Updated</h3>
                <p>Recommendations adapt dynamically based on student performance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Loved by Educators & Students
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Real stories from real users.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                name: 'Sarah Johnson',
                role: 'English Teacher',
                quote:
                  '"TeachBot cut my grading time in half. The feedback quality is impressive!"',
              },
              {
                name: 'Michael Chen',
                role: 'High School Student',
                quote:
                  '"I get feedback within minutes. It helps me improve faster than ever."',
              },
              {
                name: 'Lisa Patel',
                role: 'Parent',
                quote:
                  '"Finally, I can stay involved in my son’s education with clear updates every week."',
              },
            ].map((t, idx) => (
              <div
                key={idx}
                className="testimonial-card bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-teal-500 flex items-center justify-center text-white font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold">{t.name}</h4>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{t.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-16 text-white text-center"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Ready to Transform Education?
          </h2>
          <p className="mt-4 text-xl opacity-90">
            Join thousands of schools already using TeachBot to save time and boost learning.
          </p>
          <div className="mt-8">
            <a
              href="/signup"
              className="inline-block px-10 py-4 rounded-xl text-lg font-semibold bg-white text-primary shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
              style={{ color: 'var(--color-primary)' }}
            >
              Start Free Trial
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Product
              </h3>
              <ul className="mt-4 space-y-2">
                {['Features', 'Dashboards', 'Testimonials', 'FAQ'].map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase().replace(' ', '-')}`}
                      onClick={(e) =>
                        handleScroll(e, item.toLowerCase().replace(' ', '-'))
                      }
                      className="text-base text-gray-500 hover:text-gray-900 nav-link"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Company
              </h3>
              <ul className="mt-4 space-y-2">
                {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-base text-gray-500 hover:text-gray-900 nav-link"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Legal
              </h3>
              <ul className="mt-4 space-y-2">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-base text-gray-500 hover:text-gray-900 nav-link"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-200 pt-8">
            <p className="text-base text-gray-400 text-center">
              © 2025 TeachBot. Empowering education with AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;