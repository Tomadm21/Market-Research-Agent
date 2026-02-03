
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

// ---- Fonts ----
async function getFont() {
    const response = await fetch('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff');
    return await response.arrayBuffer();
}

// ---- Icons (Simple SVG Paths) ----
const Icons = {
    Brain: (props: any) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" /><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" /><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" /><path d="M17.599 6.5a3 3 0 0 0 .399-1.375" /><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" /><path d="M3.477 12.578c.07.36.16.716.291 1.061" /><path d="M20.232 13.639c.13-.345.22-.701.29-1.061" /></svg>
    ),
    Search: (props: any) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
    ),
    Chart: (props: any) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
    ),
    Document: (props: any) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>
    ),
    Server: (props: any) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="8" x="2" y="2" rx="2" ry="2" /><rect width="20" height="8" x="2" y="14" rx="2" ry="2" /><line x1="6" x2="6.01" y1="6" y2="6" /><line x1="6" x2="6.01" y1="18" y2="18" /></svg>
    ),
    Globe: (props: any) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>
    )
}

// 1. Workflow Architecture
const WorkflowDiagram = () => {
    return (
        <div tw="flex w-full h-full bg-[#0f172a] text-white p-12 items-center justify-center relative">
            {/* Background Orbs (Simulated with div and border-radius, Satori doesn't do blur well so we use opacity) */}
            <div tw="absolute top-0 left-0 w-full h-full bg-[#0f172a]" />
            <div tw="absolute top-[-50px] left-[-50px] w-[500px] h-[500px] rounded-full" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }} />
            <div tw="absolute bottom-[-50px] right-[-50px] w-[500px] h-[500px] rounded-full" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }} />

            <div tw="flex flex-col items-center w-full max-w-6xl">
                <div tw="flex mb-16">
                    <h1 style={{ backgroundImage: 'linear-gradient(to right, #60a5fa, #c084fc)', backgroundClip: 'text', color: 'transparent', fontSize: '60px', fontWeight: 900 }}>
                        Autonomous Research Pipeline
                    </h1>
                </div>

                <div tw="flex w-full justify-between items-center relative" style={{ gap: '40px' }}>
                    {/* Connecting Line */}
                    <div tw="absolute top-1/2 left-0 w-full h-1 bg-gray-800" style={{ zIndex: -1 }} />

                    {/* Step 1: Strategist */}
                    <div tw="flex flex-col items-center bg-[#1e293b] p-8 rounded-3xl border border-gray-700 shadow-xl w-64 h-80 justify-between">
                        <div tw="flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-900 text-blue-400">
                            <Icons.Brain width={48} height={48} color="#60a5fa" />
                        </div>
                        <div tw="flex flex-col items-center text-center">
                            <span tw="text-2xl font-bold mb-2 text-blue-400">Strategist</span>
                            <span tw="text-gray-400 text-lg">Analyzes topic &amp; plans research</span>
                        </div>
                        <div tw="flex bg-blue-900 px-3 py-1 rounded-full border border-blue-800">
                            <span tw="text-blue-300 text-sm">Step 1</span>
                        </div>
                    </div>

                    {/* Step 2: Researcher */}
                    <div tw="flex flex-col items-center bg-[#1e293b] p-8 rounded-3xl border border-gray-700 shadow-xl w-64 h-80 justify-between">
                        <div tw="flex items-center justify-center w-20 h-20 rounded-2xl bg-purple-900 text-purple-400">
                            <Icons.Globe width={48} height={48} color="#c084fc" />
                        </div>
                        <div tw="flex flex-col items-center text-center">
                            <span tw="text-2xl font-bold mb-2 text-purple-400">Researcher</span>
                            <span tw="text-gray-400 text-lg">Executes live web searches</span>
                        </div>
                        <div tw="flex bg-purple-900 px-3 py-1 rounded-full border border-purple-800">
                            <span tw="text-purple-300 text-sm">Step 2</span>
                        </div>
                    </div>

                    {/* Step 3: Analyst */}
                    <div tw="flex flex-col items-center bg-[#1e293b] p-8 rounded-3xl border border-gray-700 shadow-xl w-64 h-80 justify-between">
                        <div tw="flex items-center justify-center w-20 h-20 rounded-2xl bg-pink-900 text-pink-400">
                            <Icons.Chart width={48} height={48} color="#f472b6" />
                        </div>
                        <div tw="flex flex-col items-center text-center">
                            <span tw="text-2xl font-bold mb-2 text-pink-400">Analyst</span>
                            <span tw="text-gray-400 text-lg">Extracts insights &amp; trends</span>
                        </div>
                        <div tw="flex bg-pink-900 px-3 py-1 rounded-full border border-pink-800">
                            <span tw="text-pink-300 text-sm">Step 3</span>
                        </div>
                    </div>

                    {/* Step 4: Synthesizer */}
                    <div tw="flex flex-col items-center bg-[#1e293b] p-8 rounded-3xl border border-gray-700 shadow-xl w-64 h-80 justify-between">
                        <div tw="flex items-center justify-center w-20 h-20 rounded-2xl bg-green-900 text-green-400">
                            <Icons.Document width={48} height={48} color="#4ade80" />
                        </div>
                        <div tw="flex flex-col items-center text-center">
                            <span tw="text-2xl font-bold mb-2 text-green-400">Synthesizer</span>
                            <span tw="text-gray-400 text-lg">Writes final professional report</span>
                        </div>
                        <div tw="flex bg-green-900 px-3 py-1 rounded-full border border-green-800">
                            <span tw="text-green-300 text-sm">Step 4</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// 2. Technical Architecture
const ArchitectureDiagram = () => {
    return (
        <div tw="flex w-full h-full bg-[#0f172a] text-white p-12 items-center justify-center relative">
            <div tw="absolute top-0 left-0 w-full h-full bg-[#0f172a]" />
            <div tw="absolute top-0 left-0 w-[500px] h-[500px] rounded-full" style={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }} />
            <div tw="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full" style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }} />

            <div tw="flex flex-col items-center w-full h-full max-w-6xl justify-center">
                <h1 style={{ backgroundImage: 'linear-gradient(to right, #34d399, #818cf8)', backgroundClip: 'text', color: 'transparent', fontSize: '50px', fontWeight: 900, marginBottom: '60px' }}>
                    System Architecture
                </h1>

                {/* Main Container - Flex Row */}
                <div tw="flex items-center justify-center w-full" style={{ gap: '60px' }}>

                    {/* Client Side */}
                    <div tw="flex flex-col items-center" style={{ gap: '20px' }}>
                        <div tw="bg-[#1e293b] border-2 border-indigo-900 p-8 rounded-2xl w-80 h-96 flex flex-col items-center shadow-2xl relative">
                            <div tw="absolute -top-4 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Frontend</div>
                            <div tw="flex items-center mb-8 mt-2" style={{ gap: '12px' }}>
                                <Icons.Server className="w-12 h-12" color="#818cf8" />
                                <span tw="text-2xl font-bold">Next.js App</span>
                            </div>

                            <div tw="flex flex-col w-full" style={{ gap: '16px' }}>
                                <div tw="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center justify-center text-indigo-200 text-lg">
                                    Research Dashboard
                                </div>
                                <div tw="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center justify-center text-indigo-200 text-lg">
                                    SSE Stream Listener
                                </div>
                                <div tw="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center justify-center text-indigo-200 text-lg">
                                    Markdown Viewer
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Flow Arrows */}
                    <div tw="flex flex-col justify-center items-center h-full" style={{ gap: '30px' }}>
                        <div tw="flex items-center justify-center w-24 h-10 bg-indigo-900 rounded-lg border border-indigo-700">
                            <span tw="text-xs text-indigo-200 font-bold">SSE Stream</span>
                        </div>
                        <div tw="w-full h-[2px] bg-gray-700"></div>
                    </div>

                    {/* Server Side */}
                    <div tw="flex flex-col items-center" style={{ gap: '20px' }}>
                        <div tw="bg-[#1e293b] border-2 border-emerald-900 p-8 rounded-2xl w-80 h-96 flex flex-col items-center shadow-2xl relative">
                            <div tw="absolute -top-4 bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-bold">Backend</div>
                            <div tw="flex items-center mb-8 mt-2" style={{ gap: '12px' }}>
                                <Icons.Server className="w-12 h-12" color="#34d399" />
                                <span tw="text-2xl font-bold">FastAPI</span>
                            </div>

                            <div tw="flex flex-col w-full" style={{ gap: '16px' }}>
                                <div tw="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-center text-emerald-200 font-bold text-lg">
                                    Agent Orchestrator
                                </div>
                                <div tw="flex" style={{ gap: '10px' }}>
                                    <div tw="flex-1 bg-slate-800 p-3 rounded-lg border border-slate-700 text-center text-xs text-slate-400">Prometheus</div>
                                    <div tw="flex-1 bg-slate-800 p-3 rounded-lg border border-slate-700 text-center text-xs text-slate-400">Config</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Flow Arrows */}
                    <div tw="flex flex-col justify-center items-center h-full" style={{ gap: '30px' }}>
                        <div tw="flex items-center justify-center w-24 h-10 bg-gray-800 rounded-lg border border-gray-700">
                            <span tw="text-xs text-gray-400 font-bold">REST API</span>
                        </div>
                        <div tw="w-full h-[2px] bg-gray-700"></div>
                    </div>


                    {/* External APIs */}
                    <div tw="flex flex-col items-center" style={{ gap: '20px' }}>
                        <div tw="flex flex-col" style={{ gap: '20px' }}>
                            <div tw="bg-[#1e293b] border border-blue-900 p-4 rounded-xl w-64 h-24 flex items-center shadow-xl" style={{ gap: '16px' }}>
                                <div tw="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center border border-blue-700">
                                    <Icons.Brain className="w-6 h-6" color="#60a5fa" />
                                </div>
                                <div tw="flex flex-col">
                                    <span tw="font-bold text-lg text-white">Google Gemini</span>
                                    <span tw="text-xs text-gray-400">LLM Inference</span>
                                </div>
                            </div>

                            <div tw="bg-[#1e293b] border border-orange-900 p-4 rounded-xl w-64 h-24 flex items-center shadow-xl" style={{ gap: '16px' }}>
                                <div tw="w-12 h-12 rounded-full bg-orange-900 flex items-center justify-center border border-orange-700">
                                    <Icons.Search className="w-6 h-6" color="#fb923c" />
                                </div>
                                <div tw="flex flex-col">
                                    <span tw="font-bold text-lg text-white">Brave Search</span>
                                    <span tw="text-xs text-gray-400">Real-time Web Data</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}


async function main() {
    const fontData = await getFont();
    const outputDir = join(__dirname, '../../assets'); // Save to project root 'assets' folder

    try {
        mkdirSync(outputDir, { recursive: true });
    } catch (e) { }

    // 1. Generate Workflow Diagram
    // 1400x700
    const workflowSvg = await satori(
        <WorkflowDiagram />,
        {
            width: 1400,
            height: 700,
            fonts: [
                {
                    name: 'Inter',
                    data: fontData,
                    weight: 400,
                    style: 'normal',
                },
                {
                    name: 'Inter',
                    data: fontData,
                    weight: 900,
                    style: 'normal',
                }
            ],
        }
    );

    const resvgWorkflow = new Resvg(workflowSvg, { fitTo: { mode: 'width', value: 2800 } });
    const workflowPng = resvgWorkflow.render();
    writeFileSync(join(outputDir, 'workflow-diagram.png'), workflowPng.asPng());
    console.log('✅ Generated workflow-diagram.png');

    // 2. Generate Architecture Diagram
    const archSvg = await satori(
        <ArchitectureDiagram />,
        {
            width: 1400,
            height: 800,
            fonts: [
                {
                    name: 'Inter',
                    data: fontData,
                    weight: 400,
                    style: 'normal',
                },
                {
                    name: 'Inter',
                    data: fontData,
                    weight: 900,
                    style: 'normal',
                }
            ],
        }
    );

    const resvgArch = new Resvg(archSvg, { fitTo: { mode: 'width', value: 2800 } });
    const archPng = resvgArch.render();
    writeFileSync(join(outputDir, 'architecture-diagram.png'), archPng.asPng());
    console.log('✅ Generated architecture-diagram.png');

}

main().catch(console.error);
