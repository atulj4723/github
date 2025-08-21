import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "highlight.js/styles/github-dark.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "GitHub Explain",
    description: "Explain any GitHub repository with an AI-powered chat bot.",
};

export default function RootLayout({ children }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "GitHub Explain",
        url: "https://githubexplain.vercel.app", // Replace with your domain
        applicationCategory: "DeveloperTool",
        operatingSystem: "All",
        description: "An AI-powered tool to analyze and explain GitHub repositories.",
        offers: {
            "@type": "Offer",
            "price": "0",
        },
    };

    return (
        <html lang="en">
            <body>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                {children}
            </body>
        </html>
    );
}