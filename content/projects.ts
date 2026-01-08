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
  // Optional additional images for a section (rendered below the primary image)
  images?: MediaImage[]
  // Optional credits for the section (names or short attributions)
  credits?: string[]
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
  // Optional: team members involved in the project
  team?: { name: string; major?: string; role?: string; photo?: string }[]
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
  time: 'Fall 2025',
    location: 'State College, PA',
    summary:
      'A research prototype focusing on precise multi-directional maneuvering, featuring sensor fusion and bespoke flight modes for confined or complex environments.',
    tech: ['STM32', 'C/C++', 'PX4/ArduPilot (custom)', 'Sensor Fusion', 'PID', 'IMU', 'ESC', 'CAD'],
    tags: ['C++', 'Firmware Development', 'UAV Robotics', 'Control Systems', 'Electrical Design', 'System Integration', 'Soldering', 'Mechanical Assistance', 'Technical Communication', 'Hardware Integration'],
    team: [
      { name: 'Ky-Anh Nguyen', major: 'Electrical Engineering' },
      { name: 'Dylan DeCelle', major: 'Mechanical Engineering' },
      { name: 'John Macdonald', major: 'Mechanical Engineering' },
      { name: 'Samit Madatanapalli', major: 'Computer Engineering' },
      { name: 'Peniel Padillo', major: 'Engineering Science' },
      { name: 'Hamid Shah', major: 'Computer Science' },
      // Sponsors & advisors (appear under team in UI)
      { name: 'Hunter Howard', role: 'Esotaira Sponsor' },
      { name: 'Justin Carr', role: 'Unmanned Systems of America' },
      { name: 'Paul Mittan', role: 'Director of Engineering Leadership Development' },
    ],
    highlights: [
      'Custom flight controller firmware with multi-axis stabilization loops (PID)',
      'Sensor fusion with IMU + barometer; soft-fail handling and safe arming',
      'Configurable flight modes for hover, path follow, and tight-space translation',
    ],
    media: [
      {
        type: 'video',
        src: '/projects/esotaira-omnidirectional-drone/herovideoesotaria.mp4',
        caption: 'Esotaira prototype hero',
        sources: [
          { src: '/projects/esotaira-omnidirectional-drone/herovideoesotaria.mp4', type: 'video/mp4' },
        ],
      },
      {
        type: 'video',
        src: '/projects/esotaira-omnidirectional-drone/IMG_3910.mp4',
        caption: 'Additional Esotaira clip',
        sources: [
          { src: '/projects/esotaira-omnidirectional-drone/IMG_3910.mp4', type: 'video/mp4' },
        ],
      },
    ],
    sections: [
      { title: 'About the Project', paragraphs: ['The Esotaira Tilt Propulsion project focuses on developing a 180° tilt mechanism that enables UAVs to transition between traditional and omnidirectional flight. The final system integrates high precision mechanical components with real time firmware to ensure stable and accurate control under active thrust.'] },
      {
        title: 'Mechanical Design',
        paragraphs: [
          'The mechanical goal of this project was to build a rigid tilting assembly that stays stable while the motors are running at high speeds. While the full UAV concept utilizes 12 propellers, our team was specifically responsible for the four central modules that provide the primary 0–180° tilt range for omnidirectional maneuvering.',
          'Module Construction & Materials — To keep the design lightweight but strong, we used Onyx 3D-printed parts (carbon-fiber reinforced nylon). My role involved the fitting and finishing of these printed components to ensure the gears moved smoothly. Each module was built to be completely modular and met the strict weight requirement of under 0.50 lb per unit.',
          'Safety & Testing Enclosure — Because we were testing live high-speed propellers, we built a custom Testing Box to keep the team safe. The enclosure features a solid wood base and walls made of epoxy-glass sheets, which are incredibly impact-resistant and clear for easy observation. This rig allowed us to push our "middle 4" propellers to full throttle while testing the 0–180° transitions, ensuring the mechanical stops and locking held up under near real-world stress.'
        ],
        image: { type: 'image', src: '/projects/esotaira-omnidirectional-drone/mechanical.png', alt: 'Mechanical testing box and tilt module', caption: 'Testing rig and central tilt module' },
        credits: ['Dylan DeCelle', 'John Macdonald', 'Ky-Anh Nguyen'],
      },
      {
        title: 'Electrical Design',
        paragraphs: [
          'The electrical system provides the power and control signals needed to move the tilt actuators and spin the motors. I shared the responsibility of designing and integrating all electrical components with Ky-Anh Nguyen to ensure the system remained stable and responsive, even when the motors were running at full speed.',
          '- Soldered & Heat-Shrunk: Every connection was soldered and used heat-shrink tubing for permanent, professional-grade durability.',
          '- Strategic Routing: Wires were carefully organized and tied down to stay clear of the moving gears and tilting mounts.',
          '- Manual Interface: We designed a control board with dual potentiometers, allowing us to manually adjust both thrust and tilt angle at the same time during testing.',
          '- Dedicated Housing: We integrated a central protective case to keep the Arduino and battery safe from the mechanical movement of the modules.',


        ],

        image: { type: 'image', src: '/projects/esotaira-omnidirectional-drone/electrical.png', alt: 'Electrical layout and prototype PCB', caption: 'Wiring and control board' },
        images: [
          { type: 'image', src: '/projects/esotaira-omnidirectional-drone/circuit_diagram.png', alt: 'Circuit diagram', caption: 'Circuit schematic' },
        ],
        credits: ['Samit Madatanapalli', 'Ky-Anh Nguyen'],
      },
      
      {
        title: 'Firmware Design',
        paragraphs: [
          'I developed the C++ firmware that acts as the system\'s central logic, synchronizing mechanical tilt with motor thrust. The primary focus was maintaining high-precision control and system stability during the intense vibrations of active propulsion.',
          '- Signal Processing: Implemented input filtering and smoothing to eliminate electrical noise, ensuring fluid motion and a positional accuracy of ±0.5°.',
          '- Motion Profiling: Integrated slew rate limiting to govern transition speeds, protecting the 3D-printed gears from sudden mechanical stress.',
          '- Vibration Stability: Developed deadband logic and software thresholds to keep the actuators stable and silent when no user input is detected.',
          '- Power Optimization: Designed a motor-management routine that balances holding torque with heat reduction, keeping the mechanism locked during high-thrust maneuvers.',
          '- Safety Constraints: Hardcoded operational limits to prevent over-rotation, protecting the internal wiring and mechanical stop-points.',
        ],
        image: { type: 'image', src: '/projects/esotaira-omnidirectional-drone/firmware.png', alt: 'Firmware architecture and logs', caption: 'Firmware overview' },
        images: [
          { type: 'image', src: '/projects/esotaira-omnidirectional-drone/context_diagram.png', alt: 'Firmware context diagram', caption: 'Context diagram' },
        ],
        credits: ['Samit Madatanapalli'],
      },
    ],
  },
  {
    slug: 'ai-surveillance-drone',
    title: 'AI Surveillance Drone',
    desc: 'This project is an offline object detection system that uses a DIY drone and a Raspberry Pi to identify objects without an internet connection. It is designed to work in remote or restricted areas where cloud services are unavailable.',
    time: '2024–2025',
    location: 'Personal Project · Remote / Field Tests',
    summary: 'Offline object detection on a DIY drone using a Raspberry Pi for edge inference (YOLO).',
    tech: ['Raspberry Pi 5', 'Python', 'OpenCV', 'YOLO (TFLite)', 'Touchscreen UI'],
    tags: ['Edge AI', 'Computer Vision', 'Robotics', 'Offline'],
    highlights: [
      'Offline object detection (people & vehicles) processed on-device',
      'Raspberry Pi 5 runs YOLO-based model for real-time inference',
      'Touchscreen display with live bounding boxes and confidence scores',
    ],
    media: [
      {
        type: 'video',
        src: '/projects/offline-ai-drone/demo.mp4',
        poster: '/projects/offline-ai-drone/poster.jpg',
        caption: 'Demo: offline object detection on the Pi',
        sources: [{ src: '/projects/offline-ai-drone/demo.mp4', type: 'video/mp4' }],
      },
      { type: 'image', src: '/projects/offline-ai-drone/presentation.HEIC', alt: 'Presentation HEIC' },
    ],
    body: 'This project is an offline object detection system that uses a DIY drone and a Raspberry Pi to identify objects without an internet connection. It is designed to work in remote or restricted areas where cloud services are unavailable.\n+2',
    sections: [
      {
        title: 'How It Works',
        paragraphs: [
          'Capture: A quadrotor drone captures live video footage.',
          '+2',
          'Process: A Raspberry Pi 5 runs a local AI model (YOLO) to identify objects in the video.',
          '+1',
          'Display: A touchscreen shows the processed video with bounding boxes around detected objects.',
          '+2',
          'Offline: The system uses physical connections and local processing to remove all reliance on the cloud.',
          '+1',
          '[Insert Video Demo Here]',
          'The model identifies people and vehicles in real-time with confidence scores, processed entirely on the local hardware.',
        ],
      },
      {
        title: 'Engineering Workaround',
        paragraphs: [
          "Because the drone's video stream was locked within a proprietary app, I engineered a workaround to bridge the footage from a mobile device to the Raspberry Pi via a USB connection. This allowed the software to access the stream for real-time analysis without needing the internet.",
          '+1',
        ],
      },
      {
        title: 'Future Improvements',
        bullets: [
          'Processing Power: Adding a dedicated GPU or TPU for faster, more accurate AI models.',
          'Automated Reports: Creating logs that summarize what was detected and when to save review time.',
          'Direct Streaming: Using open-source drones to stream video directly to the Pi without a middle device.',
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
