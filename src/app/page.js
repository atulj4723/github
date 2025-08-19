"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Page = () => {
    const [repoUrl, setRepoUrl] = useState("");
    const router = useRouter();

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            const url = new URL(repoUrl);
            const pathParts = url.pathname.split("/").filter(Boolean);
            if (url.hostname === "github.com" && pathParts.length >= 2) {
                const [owner, repo] = pathParts;
                router.push(`/${owner}/${repo}`);
            } else {
                alert("Please enter a valid GitHub repository URL.");
            }
        } catch (error) {
            alert("Invalid URL provided.");
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <header className="bg-gray-800 p-4 shadow-md sticky top-0">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-indigo-400">
                        GitHub Explain
                    </h1>
                    <nav>
                        <a
                            href="#features"
                            className="text-gray-300 hover:text-white px-3">
                            Features
                        </a>
                        <a
                            href="#developer"
                            className="text-gray-300 hover:text-white px-3">
                            For Developers
                        </a>
                        <a
                            href="#about"
                            className="text-gray-300 hover:text-white px-3">
                            About
                        </a>
                    </nav>
                </div>
            </header>

            <main className="container mx-auto mt-10 p-6 text-center">
                <section id="hero" className="mb-20">
                    <h2 className="text-5xl font-extrabold mb-4">
                        Understand Any GitHub Repository in Seconds
                    </h2>
                    <p className="text-2xl text-indigo-400 font-semibold mb-6">
                        The AI Assistant for Every Developer
                    </p>
                    <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
                        Just paste a GitHub repository URL below and get a
                        complete explanation of the code, dependencies, and
                        more.
                    </p>
                    <form
                        className="flex justify-center"
                        onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Enter GitHub Repository URL"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                            className="w-full max-w-md p-3 rounded-l-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                        />
                        <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-r-lg transition-colors">
                            Analyze
                        </button>
                    </form>
                </section>

                <section id="features" className="mb-20">
                    <h3 className="text-3xl font-bold mb-10">
                        Why Use GitHub Explain?
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <h4 className="text-xl font-semibold mb-2 text-indigo-400">
                                AI-Powered Explanations
                            </h4>
                            <p className="text-gray-400">
                                Get clear and concise explanations of the
                                repository's purpose, structure, and
                                functionality, powered by AI.
                            </p>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <h4 className="text-xl font-semibold mb-2 text-indigo-400">
                                Interactive Code Viewer
                            </h4>
                            <p className="text-gray-400">
                                Browse the repository's files and folders with
                                an intuitive and interactive code viewer.
                            </p>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <h4 className="text-xl font-semibold mb-2 text-indigo-400">
                                Dependency Analysis
                            </h4>
                            <p className="text-gray-400">
                                Understand the project's dependencies and how
                                they are used within the repository.
                            </p>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <h4 className="text-xl font-semibold mb-2 text-indigo-400">
                                AI Chatbot Assistant
                            </h4>
                            <p className="text-gray-400">
                                Ask questions and get instant answers about the
                                code from our intelligent chatbot.
                            </p>
                        </div>
                    </div>
                </section>

                <section
                    id="developer"
                    className="mb-20 text-left bg-gray-800 p-8 rounded-lg">
                    <h3 className="text-3xl font-bold mb-6 text-center text-indigo-400">
                        Built for Developers, by Developers
                    </h3>
                    <p className="text-lg text-gray-400 mb-4">
                        We understand the challenges of diving into a new
                        codebase. GitHub Explain is designed to streamline your
                        workflow and accelerate your understanding of any
                        project.
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                        <li>Quickly onboard to new projects and teams.</li>

                        <li>
                            Explore open-source projects without the steep
                            learning curve.
                        </li>
                        <li>
                            Get unstuck faster by asking the AI assistant for
                            help.
                        </li>
                    </ul>
                </section>

                <section
                    id="about"
                    className="mb-20 text-left bg-gray-800 p-8 rounded-lg">
                    <h3 className="text-3xl font-bold mb-6 text-center text-indigo-400">
                        About GitHub Explain
                    </h3>
                    <p className="text-lg text-gray-400">
                        GitHub Explain is an open-source project dedicated to
                        making code more accessible and understandable for
                        everyone. Our mission is to leverage the power of
                        artificial intelligence to demystify complex codebases,
                        allowing developers to focus on what they do best:
                        building amazing software. Whether you're a seasoned
                        developer or just starting, GitHub Explain is here to
                        help you navigate the world of code with confidence.
                    </p>
                </section>
            </main>

            <footer className="bg-gray-800 p-4 mt-10">
                <div className="container mx-auto text-center text-gray-500">
                    <p>&copy; 2025 GitHub Explain. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Page;
