import {
  UserRound,
  Phone,
  Mail,
  Github,
  Linkedin,
  Globe,
} from 'lucide-react'

const contacts = [
  {
    icon: UserRound,
    label: 'Developer',
    value: 'Talha Jobayer Zihan',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+880 1721 577792',
    href: 'tel:+8801721577792',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'jobayertalha2020@gmail.com',
    href: 'mailto:jobayertalha2020@gmail.com',
  },
  {
    icon: Github,
    label: 'GitHub',
    value: 'github.com/jobayertalha',
    href: 'https://github.com/jobayertalha',
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    value: 'linkedin.com/in/talha-jobayer',
    href: 'https://www.linkedin.com/in/talha-jobayer-696a74237/',
  },
  {
    icon: Globe,
    label: 'Portfolio',
    value: 'Personal Portfolio',
    href: 'https://v0-personal-portfolio-site-tau.vercel.app/',
  },
]

const socials = [
  {
    icon: Github,
    name: 'GitHub',
    href: 'https://github.com/jobayertalha',
  },
  {
    icon: Linkedin,
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/talha-jobayer-696a74237/',
  },
  {
    icon: Globe,
    name: 'Portfolio',
    href: 'https://v0-personal-portfolio-site-tau.vercel.app/',
  },
]

export default function Contact() {
  return (
    <main className="page contact-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Get in touch</p>
          <h1>📞 Contact</h1>
          <p className="muted">
            Get in touch with the developer.
          </p>
        </div>
      </section>

      <section className="contact-card">
        {contacts.map(({ icon: Icon, label, value, href }) => (
          <div className="contact-item" key={label}>
            <div className="contact-icon">
              <Icon size={20} />
            </div>

            <div className="contact-label">
              {label}
            </div>

            <div className="contact-value">
              {href ? (
                <a
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noreferrer' : undefined}
                >
                  {value}
                </a>
              ) : (
                value
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="social-section">
        <h2>Connect With Me</h2>

        <div className="social-grid">
          {socials.map(({ icon: Icon, name, href }) => (
            <a
              className="social-card"
              href={href}
              target="_blank"
              rel="noreferrer"
              key={name}
            >
              <Icon size={24} />
              <span>{name}</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  )
}