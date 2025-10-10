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
  // Timeline / when the project was primarily developed (displayed in UI)
  time?: string
  // Location or context (e.g., State College, PA · Personal Project)
  location?: string
  // Optional hero height overrides (base + md breakpoint). Values should be Tailwind height utility classes.
  heroHeights?: { base: string; md?: string }
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
  // 2025 – 2026
  {
    slug: 'esotaira-omnidirectional-drone',
    title: 'Esotaira Omnidirectional Drone',
    desc: 'Experimental multi-axis drone platform with custom control firmware and advanced stabilization.',
  time: '2025 – 2026',
    location: 'Capstone / Research – State College, PA',
    summary:
      'A research prototype focusing on precise multi-directional maneuvering, featuring sensor fusion and bespoke flight modes for confined or complex environments.',
    tech: ['STM32', 'C/C++', 'PX4/ArduPilot (custom)', 'Sensor Fusion', 'PID', 'IMU', 'ESC', 'CAD'],
    tags: ['Flight Control', 'Sensor Fusion', 'Embedded', 'Real-time'],
    highlights: [
      'Custom flight controller firmware with multi-axis stabilization loops (PID)',
      'Sensor fusion with IMU + barometer; soft-fail handling and safe arming',
      'Configurable flight modes for hover, path follow, and tight-space translation',
    ],
    media: [
      { type: 'image', src: '/placeholder/project-drone-esotaira.jpg', alt: 'Esotaira Omnidemensial Drone prototype' },
    ],
    sections: [
      { title: 'About the Project', paragraphs: ['An experimental drone platform aimed at precision and stability in constrained spaces. Focused on control loops, sensor fusion, and robust fail-safes.'] },
      { title: 'Features', bullets: ['Multi-axis control firmware', 'Sensor fusion (IMU + baro)', 'Custom flight modes', 'Safety/arming checks'] },
      { title: 'Technical Implementation', bullets: ['PID loops tuned for fast response', 'Interrupt-driven sensor reads', 'Calibrated IMU alignment and filtering', 'Telemetry over UART/USB'] },
    ],
  },
  {
    slug: 'ai-surveillance-drone',
    title: 'AI Surveillance Drone',
    desc: 'AI-driven surveillance drone with onboard vision for detection/tracking and autonomous patrol.',
    time: '2025 – 2026',
    location: 'EE497 Project  – State College, PA',
    summary:
      'Edge vision + autonomy on a stable flight stack: detect, track, and patrol defined areas with safety-first controls.',
    tech: ['Python', 'OpenCV', 'TensorFlow Lite', 'Onboard SBC', 'PX4'],
    tags: ['Autonomy', 'Computer Vision', 'Robotics'],
    highlights: [
      'Onboard CV pipeline for detection/tracking (edge-optimized)',
      'Autonomous patrol routes with geo-fence and RTH safety',
      'Modular model/runtime to swap detectors and trackers',
    ],
    media: [
      {
        type: 'video',
        src: '/projects/ai-surveillance-drone/intro.mp4',
        poster: '/projects/ai-surveillance-drone/poster.jpg',
        caption: 'Intro presentation teaser',
        sources: [
          { src: '/projects/ai-surveillance-drone/intro.mp4', type: 'video/mp4' },
          // Optional additional sources for wider support
          // { src: '/projects/ai-surveillance-drone/intro.webm', type: 'video/webm' },
        ],
      },
      { type: 'image', src: '/placeholder/project-drone-smart.jpg', alt: 'AI Surveillance Drone mockup' },
    ],
    sections: [
      {
        title: 'About the Project',
        paragraphs: [
          'An AI-assisted surveillance drone that can autonomously patrol areas, detect and track targets, and return home safely. Focus on edge inference reliability and deterministic behavior.',
        ],
      },
      {
        title: 'Project Plan (Template)',
        bullets: [
          'Objectives: Autonomous patrol, object/person detection, basic tracking, geo-fence + RTH safety',
          'Deliverables: Flight-ready prototype, demo video, short technical write-up, and code repo (private/public TBD)',
          'Success Criteria: Stable hover, successful patrol route, reliable detections (>80% on test cases), clean failsafes',
        ],
      },
      {
        title: 'Planned Architecture',
        bullets: [
          'Airframe + FCU: PX4-based autopilot with position hold and mission execution',
          'Compute: Onboard SBC (e.g., Pi/Jetson) running OpenCV + TFLite (or ONNXRuntime) for inference',
          'Perception: Camera → pre-processing → model inference → tracking (e.g., KCF/DeepSORT-lite)',
          'Navigation: Waypoint mission with patrol loops and on-detection loiter',
          'Comms: MAVLink to FCU; optional ground station link for status',
          'Safety: Geo-fence, battery threshold RTL, manual override',
        ],
      },
      {
        title: 'Milestones & Timeline',
        bullets: [
          'M1: Baseline flight (hover, manual, position hold)',
          'M2: Vision prototype on the bench (live camera to detections)',
          'M3: Tracking + basic patrol mission',
          'M4: Integrated flight test with detection-triggered behavior',
          'M5: Demo polish (stability, logging, video capture)',
        ],
      },
      {
        title: 'Risks & Mitigations',
        bullets: [
          'Compute limits → Use lightweight models (TFLite/INT8) and crop/resize inputs',
          'False positives → Confidence thresholds + temporal smoothing',
          'GPS/IMU drift → Conservative mission speeds and tighter failsafes',
          'Weather/wind → Indoor test harness; schedule outdoor tests with low wind',
        ],
      },
      {
        title: 'Video Placeholder',
        paragraphs: [
          'A project intro/teaser video will appear above as the hero once uploaded. Replace the /projects/ai-surveillance-drone/intro.mp4 and poster.jpg files with the final assets.',
        ],
      },
    ],
  },
  // 2024
  {
    slug: 'ai-fitness-tracker',
    title: 'AI Fitness Tracker',
    desc: 'Full-stack app with Java Servlets, MySQL, and ChatGPT API for natural language diet input.',
    time: '2024',
    location: 'Personal Project – Pittsburgh, PA',
    summary:
      'Users log workouts and meals in natural language. A GPT-powered parser extracts macros and intents, with trend dashboards and reminders.',
    tech: ['Java', 'Servlets', 'MySQL', 'OpenAI API', 'Tailwind', 'Chart.js'],
    tags: ['Java', 'Servlets', 'MySQL', 'NLP', 'OpenAI API', 'Next.js', 'TypeScript', 'Tailwind', 'Charts'],
    // Use the provided logo as the project card image in the grid
    cardImage: '/projects/ai-fitness-tracker/aifitnesstrackericonimage.png',
    highlights: [
      'Natural-language meal logging and macro extraction',
      'Auth + role-based views with account management',
      'Trends dashboard and reminders',
    ],
    media: [
      { type: 'image', src: '/projects/ai-fitness-tracker/personalhealthlogo.png', alt: 'AI Fitness Tracker meal logging preview' },
    ],
    sections: [
      {
        title: 'About the Project',
        paragraphs: [
          'AI Fitness Tracker lets you log meals and workouts using plain English. It parses foods, serving sizes, and macros to maintain daily totals and trends.',
          'Important: The production/full version (not included in this site) is a Java Servlets + MySQL application with server-side authentication, persistent storage, and richer features (e.g., reminders, role-based views).',
          'This portfolio includes a small, client-only demo that re-implements natural-language meal parsing in the browser so you can quickly try it out without a backend.',
        ],
      },
      {
        title: 'Features',
        bullets: [
          'Natural-language meal logging (e.g., "2 eggs and toast with butter, coffee")',
          'Macro extraction: calories, protein, carbs, fat with a lightweight rules engine',
          'Daily totals, editable log, and simple charts',
          'Auth and roles in the original server version (Java + MySQL)',
        ],
      },
      {
        title: 'Technical Implementation',
        bullets: [
          'Full App (not included): Java Servlets backend with a normalized MySQL schema for users, meals, and nutrition entries (SQL), plus auth and reminders',
          'Parsing: tokenization + quantity/unit detection + ingredient lookup with fallback heuristics (with optional GPT-assisted parsing)',
          'Demo (this site): Client-only React/TypeScript parser, localStorage persistence, and computed totals',
          'UI: Tailwind styling and accessible forms; charts placeholder ready for plug-in',
        ],
      },
      {
        title: 'Challenges & Solutions',
        bullets: [
          'Ambiguous inputs → Fallback database with portion defaults and user adjustments',
          'Unit variety → Normalize to grams/ml; map to standard servings where possible',
          'Porting from NetBeans/Tomcat → Browser-based demo removes server dependency for easy showcase',
        ],
      },
      {
        title: 'Technologies Used',
        bullets: [
          'Java, Servlets, MySQL (original full-stack)',
          'Next.js, React, TypeScript (demo reimplementation)',
          'Tailwind CSS for UI; Chart.js (optional) for trends',
          'OpenAI API (optional) for advanced parsing and suggestions',
        ],
      },
      {
        title: 'Try the Live Demo',
        bullets: [
          'Open the in-browser demo to test natural-language meal logging and macro parsing.',
          'This is a simplified, mini demo; the real app uses Java Servlets + MySQL and is not included here.',
          'Data in this demo is stored locally in your browser (no server).',
        ],
      },
    ],
    // No downloads for this case study; keep Live Demo CTA instead
    downloads: [],
  },
  
  // New Projects
  // 2020
  {
    slug: 'police-chase',
    title: 'Police Chase',
    desc: 'Arcade-style police pursuit game with helicopters, hazards, and a reactive HUD.',
    time: '2020',
    location: 'Personal Project – Pittsburgh, PA',
  heroHeights: { base: 'h-[7vh]', md: 'md:h-[10vh]' },
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
]

export function getProjectBySlug(slug: string) {
  return PROJECTS.find((p) => p.slug === slug)
}
