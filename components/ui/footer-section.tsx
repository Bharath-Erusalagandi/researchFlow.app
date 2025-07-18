'use client';
import React from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';


interface FooterLink {
	title: string;
	href: string;
	icon?: React.ComponentType<{ className?: string }>;
}

interface FooterSection {
	label: string;
	links: FooterLink[];
}

const footerLinks: FooterSection[] = [
	{
		label: 'Product',
		links: [
			{ title: 'Features', href: '#features' },
			{ title: 'Pricing', href: '#pricing' },
			{ title: 'Testimonials', href: '#testimonials' },
			{ title: 'Integration', href: '/' },
		],
	},
	{
		label: 'Company',
		links: [
			{ title: 'FAQs', href: '/faqs' },
			{ title: 'About Us', href: '/about' },
			{ title: 'Privacy Policy', href: '/privacy' },
			{ title: 'Terms of Services', href: '/terms' },
		],
	},
];

export function Footer() {
	return (
		<footer className="relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center border-t border-gray-800 bg-black px-6 py-16">
			{/* Top edge highlight */}
			<div className="bg-[#0CF2A0]/5 absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full blur-sm" />

			<div className="grid w-full gap-10 xl:grid-cols-2">
				<div className="space-y-6">
					<div className="flex items-center gap-2">
						<img 
							src="/images/Research Flow Logo.png" 
							alt="Research Flow Logo" 
							className="h-7 w-auto"
						/>
						<span className="font-semibold text-white">Research Flow</span>
					</div>
					<p className="text-gray-400 text-sm">
						© {new Date().getFullYear()} Research Flow. All rights reserved.
					</p>
				</div>

				<div className="grid grid-cols-2 gap-10 md:grid-cols-2 xl:col-span-1">
					{footerLinks.map((section, index) => (
						<div key={section.label} className="space-y-4">
							<h3 className="text-xs font-medium text-white">{section.label}</h3>
							<ul className="space-y-3">
								{section.links.map((link) => (
									<li key={link.title}>
										<span
											className="text-gray-400 inline-flex items-center text-sm cursor-not-allowed opacity-60"
										>
											{link.icon && <link.icon className="mr-1.5 size-4" />}
											{link.title}
										</span>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</div>
		</footer>
	);
};

type ViewAnimationProps = {
	delay?: number;
	className?: ComponentProps<typeof motion.div>['className'];
	children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
	const shouldReduceMotion = useReducedMotion();

	if (shouldReduceMotion) {
		return children;
	}

	return (
		<motion.div
			initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
			whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
			viewport={{ once: true }}
			transition={{ delay, duration: 0.8 }}
			className={className}
		>
			{children}
		</motion.div>
	);
};

 