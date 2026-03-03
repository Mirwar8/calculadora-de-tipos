import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

const Footer = () => {
    const { theme } = useTheme();

    const footerSections = [
        {
            title: 'Tools',
            links: [
                { to: '/calculator', label: 'Type Calculator' },
                { to: '/teamBuilder', label: 'Team Builder' },
                { to: '/pokedex', label: 'Pokédex' },
                { to: '/emulator', label: 'GBA Emulator' },
                { to: '#', label: 'Damage Calculator' }
            ]
        },
        {
            title: 'Resources',
            links: [
                { to: '#', label: 'Type Chart' },
                { to: '#', label: 'Move Database' },
                { to: '#', label: 'Ability Guide' },
                { to: '#', label: 'EV/IV Calculator' }
            ]
        },
        {
            title: 'Community',
            links: [
                { to: '#', label: 'Discord Server' },
                { to: '#', label: 'Reddit Community' },
                { to: '#', label: 'YouTube Channel' },
                { to: '#', label: 'Twitch Streams' }
            ]
        },
        {
            title: 'Support',
            links: [
                { to: '#', label: 'Help Center' },
                { to: '#', label: 'Contact Us' },
                { to: '#', label: 'Bug Reports' },
                { to: '#', label: 'Feature Requests' }
            ]
        }
    ];

    const socialLinks = [
        {
            label: 'Discord',
            href: '#',
            svg: (
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                </svg>
            )
        },
        {
            label: 'Reddit',
            href: '#',
            svg: (
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                </svg>
            )
        },
        {
            label: 'YouTube',
            href: '#',
            svg: (
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
            )
        },
        {
            label: 'Twitter / X',
            href: '#',
            svg: (
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.26 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
                </svg>
            )
        }
    ];

    return (
        <footer className="bg-slate-900 text-white">
            <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="size-10 text-primary">
                                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold">TypeCoverage</h3>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            The ultimate Pokémon type analysis tool for competitive trainers. 
                            Build better teams, win more battles.
                        </p>
                        <div className="flex space-x-3">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors touch-target text-slate-300 hover:text-white"
                                    aria-label={social.label}
                                >
                                    {social.svg}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Footer Links */}
                    {footerSections.map((section, index) => (
                        <div key={index} className="space-y-4">
                            <h4 className="font-bold text-white">{section.title}</h4>
                            <ul className="space-y-2">
                                {section.links.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        <Link
                                            to={link.to}
                                            className="text-slate-400 hover:text-primary transition-colors text-sm"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Section */}
                <div className="mt-16 pt-8 border-t border-slate-800">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <div className="text-slate-400 text-sm">
                            © 2024 TypeCoverage. Not affiliated with Nintendo or The Pokémon Company.
                        </div>
                        <div className="flex space-x-6 text-sm">
                            <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                                Privacy Policy
                            </a>
                            <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                                Terms of Service
                            </a>
                            <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                                Cookie Policy
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;