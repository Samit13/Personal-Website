export type MediaImage = { type: 'image', src: string, alt?: string, caption?: string }
// Videos can be a single src or multiple sources for wider browser support
// Use sources for formats like mp4 / webm / mov (quicktime)
export type MediaVideo = {
  type: 'video'
  src: string
  poster?: string
  caption?: string
  // Optional multiple sources; if provided, these will be rendered as <source> tags
  sources?: { src: string; type?: string }[]
}
export type MediaEmbed = { type: 'embed', src: string, title?: string }
export type MediaItem = MediaImage | MediaVideo | MediaEmbed

export type ProjectSection = {
  title: string
  paragraphs?: string[]
  bullets?: string[]
  // Optional representative image for this section
  image?: MediaImage
}

export type ProjectDownload = {
  label: string
  href: string
}

export type Project = {
  slug: string
  title: string
  desc: string
  summary?: string
  href?: string
  tech: string[]
  // Optional: tags for skills and tools used (display chips in UI)
  tags?: string[]
  // Optional: image for the project card on the home page
  cardImage?: string
  highlights: string[]
  // New: support typed media items; keep string[] for backward compatibility
  media: string[] | MediaItem[]
  // New: optional long-form body (plain text for now; can move to MDX later)
  body?: string
  // New: optional controls list
  controls?: string[]
  // New: optional rich sections and downloads
  sections?: ProjectSection[]
  downloads?: ProjectDownload[]
}

export const PROJECTS: Project[] = [
  {
    slug: 'police-chase',
    title: 'Police Chase',
    desc: 'Arcade-style police pursuit game with helicopters, hazards, and a reactive HUD.',
    summary:
      'An arcade chase where you dodge traffic and obstacles while outsmarting police vehicles and helicopters. Score points, manage hearts, and use limited power moves to break free from tight situations.',
    tech: ['Unity', 'C#', 'Steering Behaviors', 'Game Physics'],
    cardImage: '/projects/police-chase/iconpolicechase.png',
    tags: [
      'Unity',
      'C#',
      'Game AI',
      'Pathfinding',
      'Steering Behaviors',
      'Rigidbody Physics',
      'Camera Systems',
      'Lighting',
      'UI / HUD',
      'Optimization',
      'Blender',
      'Photoshop / GIMP',
      'Git',
      'macOS',
      'Windows',
    ],
    highlights: [
      'Reactive HUD with Points and Hearts, plus a minimap overlay',
      'Police vehicles and helicopters with pursuit/evade behaviors',
      'Obstacles and pickups to force quick pathing decisions',
      'Power move (limited uses) to destroy nearby police vehicles',
    ],
    controls: [
      'W / Up — Accelerate',
      'S / Down — Brake / Reverse',
      'A / Left — Steer Left',
      'D / Right — Steer Right',
      'Shift — Activate Power-Up',
    ],
    body:
      'Police Chase is a 3D arcade-style coin collection and chase game I built during 10th grade using Unity and C#. The objective is simple: collect coins while avoiding AI-controlled police cars. ',
    sections: [
      {
        title: 'About the Project',
      },
      {
        title: 'Instructions',
        bullets: [
          'Objective: Collect coins while avoiding police cars.',
          'Coins spawn randomly around the map.',
          'Police cars chase the player with increasing aggressiveness.',
          'Power-ups (Speed Boost, Shield, Multiplier) give advantages.',
          'Game ends if the police catch the player.',
        ],
      },
      {
        title: 'Features',
        bullets: [
          'Vehicle Physics: Acceleration, velocity, turning, drift, and friction all tuned in C#.',
          'Camera System: Third-person chase camera with smooth follow, rotation interpolation, and zoom scaling at high speeds.',
          'Lighting System: Full day/night cycle with a rotating directional light to simulate sun movement.',
          'AI Opponents: Police cars pursue dynamically with adaptive speed, steering, and randomness for unpredictability.',
          'Gameplay Systems: Coins, power-ups (Speed Boost, Shield, Multiplier), scoreboard, timer, and restart logic.',
          'Performance Optimization: Stable 60 FPS achieved on both Mac & Windows executables.',
        ],
        image: { type: 'image', src: '/projects/police-chase/Screenshot Features.png', alt: 'Features overview screenshot' },
      },
      {
        title: 'Technical Implementation',
        bullets: [
          'Vehicle Dynamics (C#): Custom acceleration curves and max velocity caps; force-based steering for smooth turning and drift mechanics; adjusted center of mass to stabilize car handling during sharp turns.',
          'Camera Controller: Smooth third-person follow using lerp interpolation; speed-based zoom and tilt to give a cinematic driving feel.',
          'Lighting & Environment: Rotating directional light to simulate a sun cycle; dynamic shadows and particle effects (collisions, sparks, coin pickups).',
          'AI Pursuit Logic: Waypoint navigation + real-time pursuit adjustments; randomized pursuit angles and speed boosts to prevent predictability.',
          'Game Systems: Modular scripts for UI states, scoring, and power-ups; power-up effects integrated directly into physics (speed multiplier, temporary invincibility).',
          'Performance & Stability: Reduced physics timestep for consistent performance; optimized colliders and limited AI spawn count.',
        ],
        image: { type: 'image', src: '/projects/police-chase/Screenshot Technical.png', alt: 'Technical implementation screenshot' },
      },
      {
        title: 'Challenges & Solutions',
        bullets: [
          'Car flipping on sharp turns → Fixed by lowering Rigidbody.centerOfMass.',
          'AI too predictable → Added randomized pursuit speed and turn variance.',
          'Performance drops with too many AI cars → Reduced physics timestep + capped AI spawns.',
          'Camera jitter at high speeds → Implemented lerp smoothing and velocity-based camera offsets.',
        ],
      },
      {
        title: 'Technologies Used',
        bullets: [
          'Unity – Game engine for environment, physics, rendering.',
          'C# – Core scripting for vehicle physics, AI, camera, and UI.',
          'Blender / Free Assets – Models for cars, coins, and environment.',
          'Photoshop / GIMP – Textures and UI design.',
          'MacOS & Windows – Tested and built as standalone executables.',
        ],
      },
      {
        title: 'Download & Play',
        bullets: [
          'Platforms: MacOS & Windows',
          'Status: Fully playable demo build',
        ],
      },
    ],
    downloads: [
      { label: 'Download (MacOS)', href: '#' },
      { label: 'Download (Windows)', href: '#' },
    ],
    media: [
      { type: 'image', src: '/projects/police-chase/screenshot-01.png', alt: 'In-game chase with HUD showing Points and Hearts', caption: 'Active pursuit with helicopters overhead and obstacles along the road.' },
      {
        type: 'video',
          // Default/fallback src
          src: '/projects/police-chase/demo.mov',
          // If you add a poster.jpg later, uncomment the next line
          // poster: '/projects/police-chase/poster.jpg',
          caption: 'Gameplay recording',
          // Provide multiple sources for cross-browser support
          sources: [
            { src: '/projects/police-chase/demo.mp4', type: 'video/mp4' },
            { src: '/projects/police-chase/demo.webm', type: 'video/webm' },
            { src: '/projects/police-chase/demo.mov', type: 'video/quicktime' },
          ],
      },
    ],
  },
  {
    slug: 'ai-fitness-tracker',
    title: 'AI Fitness Tracker',
    desc: 'Full-stack app with Java Servlets, MySQL, and ChatGPT API for natural language diet input.',
    summary:
      'Users log workouts and meals in natural language. A GPT-powered parser extracts macros and intents, with trend dashboards and reminders.',
    href: 'https://example.com',
    tech: ['Java', 'Servlets', 'MySQL', 'OpenAI API', 'Tailwind', 'Chart.js'],
    highlights: [
      'Built NL diet parser with function calling to normalize foods/macros',
      'Implemented OAuth and sessions with role-based views',
      'Shipped responsive UI with charts and offline caching',
    ],
    media: ['/placeholder/project1.jpg'],
  },
  {
    slug: 'pipelined-processor',
    title: 'Pipelined Processor (Verilog)',
    desc: '5-stage pipeline with hazard detection/forwarding; verified via waveforms in Vivado.',
    summary:
      'Implements IF/ID/EX/MEM/WB, with bypassing, branch prediction, and performance counters to evaluate IPC under mixed workloads.',
    tech: ['Verilog', 'Vivado', 'SystemVerilog TB', 'Git'],
    highlights: [
      'Achieved 1.2 IPC on benchmark suite with simple predictor',
      'Developed hazard unit and forwarding network with clean timing',
      'Automated waveform checks and regression tests',
    ],
    media: ['/placeholder/project2.jpg'],
  },
  {
    slug: 'audio-amplifier-circuit',
    title: 'Audio Amplifier Circuit',
    desc: 'Multi-stage amplifier with filters and LED volume, validated on lab equipment.',
    summary:
      'Analog front-end with preamp, tone control, and output stage. Designed for low noise and flat response across audible band.',
    tech: ['LTspice', 'OP-AMP', 'Analog Filters', 'PCB'],
    highlights: [
      'Designed active filters with Bode matching to specs',
      'Built PCB and validated with oscilloscope and audio analyzer',
      'Added LED VU meter using peak detector',
    ],
    media: ['/placeholder/project3.jpg'],
  },
  {
    slug: 'espressif-ble-sensor-hub',
    title: 'Espressif BLE Sensor Hub',
    desc: 'ESP32 hub that aggregates BLE sensors and posts to a cloud dashboard.',
    summary:
      'BLE scans, pairs, and reads multiple sensors concurrently. Batches data to a server; dashboard shows live and historical metrics.',
    tech: ['ESP32', 'C/C++', 'BLE', 'MQTT', 'Next.js'],
    highlights: [
      'Custom GATT client for multi-sensor polling',
      'Wrote ring-buffered telemetry with retries/backoff',
      'Realtime graph dashboard with server-sent events',
    ],
    media: ['/placeholder/project4.jpg'],
  },
]

export function getProjectBySlug(slug: string) {
  return PROJECTS.find((p) => p.slug === slug)
}
