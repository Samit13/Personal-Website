export type AcademicKind = 'project' | 'assignment' | 'essay' | 'thesis'

export type AcademicImage = {
  src: string
  alt?: string
  width?: number
  height?: number
}

export type AcademicItem = {
  kind: AcademicKind
  slug: string
  title: string
  description?: string
  course?: string
  term?: string
  link?: string
  /** Optional hero image to show below the title */
  hero?: AcademicImage
  images?: AcademicImage[]
  /** Optional long-form HTML content to render on the detail page */
  contentHtml?: string
}

export const featuredAcademics: AcademicItem[] = [
  {
    kind: 'thesis',
    slug: 'cmpen-431-design-space-exploration',
    title: 'Design Space Exploration',
    course: 'CMPEN 431',
    term: 'Spring 2025',
    hero: {
      src: '/academics/cmpen-431-design-space-exploration/hero.png',
      alt: 'Energy, performance, and area exploration (EDP/ED²P/EDAP) illustration'
    },
    
    contentHtml: `


      <h2>Introduction</h2>
      <p>Different processors are architected with different design goals, some optimize for performance, others aim for efficiency, costs, area, or even combinations of these factors. Achieving these set goals require exploring multidimensional spaces of core microarchitecture, memory hierarchies, and cache configurations. This paper delivers a heuristic proposal to find high performing configurations under four different optimizations: Energy savings (<em>EDP</em>), Energy efficiency per area (<em>EDAP</em>), Performance sensitive (<em>ED<sup>2</sup>P</em>), and a balance of all (<em>ED<sup>2</sup>AP</em>).</p>
      <p>With a total 18 different dimensions with up to 10 indices per dimension, finding the optimal configurations would be near impossible. Therefore I designed a search algorithm that uniquely adapts for each of the different optimizations. The following sections explore more on the design space, development of heuristic strategies, results, and a final analysis.</p>

      <h2>Design Space</h2>
      <p>To make full use of the limited evaluations, the validation function is crucial for ensuring that only architecturally valid configurations are considered, allowing the algorithm to prioritize meaningful design points. To simplify the implementation, I first decoded the encoded index values into corresponding microarchitectural parameters, to enforce classes of constraints: cardinality, structural, and realism checks. Cardinality checks ensured each dimension was within its allowed minimum to maximum range. Structural constraints verified compatibility with dependent dimensions, for example <em>L2 &lt; L1D + L1I</em> and <em>L2 block size &lt; 2 × L1 block size</em>. Realism checks filtered out inefficient designs like mismatched cache latencies, bottleneck scenarios like <em>width &gt; 2 × fetch speed</em>, and other unrealistic HW constraints.</p>
      <p>Now, after filtering out invalid configurations, the next step is to narrow down configurations toward individual optimizations. Since exhaustively iterating through each possible configuration is infeasible especially under a 1000 evaluation limit, I narrowed it down by targeting heuristics that exploit architectural characteristics for each optimization: <em>EDP</em>, <em>EDAP</em>, <em>ED<sup>2</sup>P</em>, and <em>ED<sup>2</sup>AP</em>.</p>

      <p><em>EDP</em>, which emphasizes efficiency, naturally led me to exploit simplicity (narrow, in order, minimal HW). As supported by lectures and energy tables in prompt, narrow in order processors consume significantly less energy per cycle. For example, the narrowest in order pipeline only consumes <strong>8 pJ</strong>, whereas the widest out of order processors consume <strong>27 pJ</strong>. Similarly smaller HW, like cache at <strong>8 KB</strong> only use <strong>20 pJ</strong> at <strong>0.125 mW</strong> while main memory consumes <strong>20 nJ</strong> at <strong>512 mW</strong> per access.</p>

      <p><em>EDAP</em>, which emphasizes area, led me to exploit low footprint configurations that still look at energy and delay. I primarily selected an in order narrow pipeline since this significantly reduces area overhead. Additionally to what was learnt in class, the in order pipelines scale at <em>width<sup>2</sup> / 2 mm<sup>2</sup></em>, while out of order pipelines begin at <em>4 mm<sup>2</sup></em> and scales exponentially.</p>

      <p><em>ED<sup>2</sup>P</em>, which emphasizes performance, led me to prioritize wide pipelines with fast fetch speeds and out of order execution. The performance table shows how in order processors take less time per clock cycle than dynamic with the same fetch width, but as learnt in class, out of order processors exploit ILP more aggressively and though there is a 5–10 ps increase, the processors can retire more instructions per cycle since it reduces pipeline stalls and hazards. Since <em>ED<sup>2</sup>P</em> enforces delay exponentially, improving IPC is more impactful than only saving a few picoseconds of cycle time.</p>

      <p><em>ED<sup>2</sup>AP</em>, which is a mix of all the previous objectives would require a hybrid approach. Since all components dominate, exploring a wide range of configurations that balance performance, efficiency, and area without sacrificing any single metric.</p>

      <h2>Iterations of Heuristic</h2>
      <h3>Iteration 1 – Greedy Search</h3>
      <p>My first approach was a greedy, sequential approach where I initialized all dimensions to index 0, then incrementally and greedily selected space one dimension at a time. For example, in the first dimension (width), I tested all indices and locked in the index with better results. This continued for all dimensions, narrowing down to a “greedy” configuration. However, after testing, this was extremely exhaustive and I came to realize that I would be leaving many great configurations out simply due to a greedy early stage decision.</p>

      <h3>Iteration 2 – Neighbor Search</h3>
      <p>To fix the problem of bad early stage decisions and to explore more diversely, I switched to a more fair strategy that gave each dimension a chance. For each of the dimensions, I would increment its index and enclose it by modulating the valid choices:</p>
      <pre><code>configuration[dimI] = (configuration[dimI] + 1) % validChoices</code></pre>
      <p>This generates a new “neighbor” of the previous iteration changing a single dimension, so over many configurations, it improves the diversity of the search with better results. However, I noticed when running, that there would be invalid configurations which would stall progress, therefore to fix this, iteration 3 introduced an embedded validator.</p>

      <h3>Iteration 3 – Retrieval Configuration</h3>
      <p>This iteration introduced an embedded validating checker to help reduce stalls. I would invoke the <code>validateConfiguration()</code> and if it returned 0, I would know that the configuration curated in iteration 2 failed and I would return a retreated configuration using a completely random configuration which I know would be less exhaustive on the system. While the <code>431projectUtils.cpp</code> already rejects invalid configurations before finalizing them, my embedded validating checker would act earlier in the process by reducing redundant attempts within the proposal function.</p>

      <h3>Iteration 4 – Optimization based filtering</h3>
      <p>To individually exploit each of the four optimizations instead of treating all dimensions equally, I tuned specific dimensions to take advantage of architectural characteristics that aligned with the selected optimized goal.</p>
      <p>For <em>ED<sup>2</sup>P</em>, I biased the configuration for high throughput, so large width, high fetch speed, and out of order execution. This aligned with the optimization with an emphasis on delay/performance rather than power. For <em>EDP</em>, I emphasized on the configuration to bias toward the lower half of the index space in each of the dimensions. This heuristic exploited simpler, more efficient hardware such as narrow in order processors and minimized HW. For <em>EDAP</em>, I emphasized on narrow in order processors and hardcoded dimensions like width, fetch speed, and scheduling. Unlike <em>EDP</em>, which randomly biases toward the lower half of each dimension, <em>EDAP</em> selectively targets values that minimize physical footprint. For <em>ED<sup>2</sup>AP</em>, I did not bias a single metric, instead I allowed all dimensions to be tunable which would allow a wide random exploration across all performance, area, and energy.</p>

    <h2>Results and Analysis</h2>
  <h3><em>EDP</em></h3>
    <figure class="chart"><img src="/academics/cmpen-431-design-space-exploration/edp.png" alt="EDP results chart" /></figure>
      <p>The early spike in the <em>EDP</em> plot shows the initial phase to explore inefficient configurations, but as more iterations were evaluated, the heuristic started to converge toward simpler and low energy efficient values. The best <em>EDP</em> configuration achieved the lowest value on benchmark 1 and the highest on benchmark 4.</p>

  <h3><em>ED<sup>2</sup>P</em></h3>
  <figure class="chart"><img src="/academics/cmpen-431-design-space-exploration/ed2p.png" alt="ED²P results chart" /></figure>
      <p>The early spike in the <em>ED<sup>2</sup>P</em> plot shows the initial phase to explore inefficient configuration, but as more iterations were evaluated, the heuristic started to converge toward high throughput designs. The best <em>ED<sup>2</sup>P</em> configuration prioritized a wider out of order processor achieving the lowest value on benchmark 1 and the highest on benchmark 0.</p>

  <h3><em>EDAP</em></h3>
  <figure class="chart"><img src="/academics/cmpen-431-design-space-exploration/edap.png" alt="EDAP results chart" /></figure>
      <p><em>EDAP</em> normalized geomean had a spiky start but as more iterations were evaluated, the heuristic started to converge toward a minimized <em>EDAP</em> around <strong>1.07 × 10<sup>−8</sup> J s mm<sup>2</sup></strong>. The best <em>EDAP</em> configuration used a narrow in order processor and low indexed dimensions to minimize a physical footprint without a huge loss in performance. This configuration achieved the lowest value on benchmark 1 and the highest on benchmark 4.</p>

  <h3><em>ED<sup>2</sup>AP</em></h3>
  <figure class="chart"><img src="/academics/cmpen-431-design-space-exploration/ed2ap.png" alt="ED²AP results chart" /></figure>
      <p>Similar to the other optimizations <em>ED<sup>2</sup>AP</em>, the normalized geomean had a spiky start but as more iterations were evaluated, the heuristic started to converge toward a minimized <em>ED<sup>2</sup>AP</em> around <strong>1.87 × 10<sup>−8</sup> J s<sup>2</sup> mm<sup>2</sup></strong>. The best <em>ED<sup>2</sup>AP</em> configuration which factors in energy, performance, and area resulted in a narrow in order processor with scattered HW configurations. It achieved the lowest value on benchmark 1 and the highest on benchmark 3.</p>

  <p>All of the optimizations were normalized to the baseline <code>(0, 0, 0, 0, 0, 0, 5, 0, 5, 0, 2, 2, 2, 3, 0, 0, 3, 0)</code>.</p>

      <h3>Best configurations</h3>
      <div class="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Dim</th>
              <th>EDP</th>
              <th>ED<sup>2</sup>P</th>
              <th>EDAP</th>
              <th>ED<sup>2</sup>AP</th>
              <th>Baseline</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>0: Width</td><td>2</td><td>4</td><td>1</td><td>1</td><td>1</td></tr>
            <tr><td>1: Fetch speed</td><td>2</td><td>2</td><td>2</td><td>2</td><td>1</td></tr>
            <tr><td>2: Scheduling</td><td>out of order</td><td>out of order</td><td>in order</td><td>in order</td><td>in order</td></tr>
            <tr><td>3: RUU Size</td><td>128</td><td>64</td><td>16</td><td>8</td><td>4</td></tr>
            <tr><td>4: LSQ Size</td><td>32</td><td>16</td><td>8</td><td>8</td><td>4</td></tr>
            <tr><td>5: Memports</td><td>1</td><td>2</td><td>2</td><td>1</td><td>1</td></tr>
            <tr><td>6: L1D sets</td><td>512</td><td>512</td><td>512</td><td>512</td><td>1024</td></tr>
            <tr><td>7: L1D ways</td><td>1</td><td>1</td><td>2</td><td>2</td><td>1</td></tr>
            <tr><td>8: L1I sets</td><td>1024</td><td>128</td><td>512</td><td>512</td><td>1024</td></tr>
            <tr><td>9: L1I ways</td><td>2</td><td>4</td><td>4</td><td>2</td><td>2</td></tr>
            <tr><td>10: Unified L2 sets</td><td>2048</td><td>256</td><td>512</td><td>512</td><td>1024</td></tr>
            <tr><td>11: Unified L2 block size</td><td>128</td><td>64</td><td>128</td><td>64</td><td>64</td></tr>
            <tr><td>12: Unified L2 ways</td><td>2</td><td>8</td><td>2</td><td>4</td><td>4</td></tr>
            <tr><td>13: TLB sets</td><td>16</td><td>8</td><td>16</td><td>64</td><td>32</td></tr>
            <tr><td>14: L1D latency</td><td>1</td><td>2</td><td>2</td><td>2</td><td>1</td></tr>
            <tr><td>15: L1I latency</td><td>4</td><td>4</td><td>4</td><td>2</td><td>1</td></tr>
            <tr><td>16: Unified L2 latency</td><td>8</td><td>8</td><td>6</td><td>7</td><td>8</td></tr>
            <tr><td>17: Branch predictor</td><td>perfect</td><td>Bimodal</td><td>2 level GAp</td><td>2 Level GAp</td><td>perfect</td></tr>
          </tbody>
        </table>
      </div>

      <h2>Conclusion</h2>
      <p>In this project, I explored a large space of processor configurations and designed heuristics for different optimization goals: <em>EDP</em>, <em>EDAP</em>, <em>ED<sup>2</sup>P</em>, and <em>ED<sup>2</sup>AP</em>. By exploiting architectural characteristics and tailoring the algorithm, I was able to find the “best” configuration across different optimizations. This project helped me better understand how microarchitectural choices affect performance, energy, and area in the real world systems.</p>

      <h2>Project Code</h2>
      <p class="text-muted" style="margin-top: 0.25rem;">In the written thesis, this section appears as an Appendix.</p>
      <p>The proposal code (<code>YOURCODEHERE-final.cpp</code>) implements the heuristic search, generating candidate processor configurations and calling into <code>431project.cpp</code> to evaluate them against benchmarks. It relies on <code>431projectUtils.cpp</code> to decode indices and enforce architectural constraints, ensuring only valid configurations are tested, while the shared header file (<code>431project.h</code>) ties these components together. The full project also includes a <code>Makefile</code> to compile everything into a single executable and a <code>worker.sh</code> script to automate multiple runs and manage evaluation limits. Here, only the proposal code is shown, as it contains the core algorithm driving the exploration process. The results it produces — including best configurations and performance metrics — form the basis for the analysis and discussion presented on this site.</p>
      <details class="code-toggle">
    <summary>Show C++ source (toggle)</summary>
    <pre><code class="language-cpp">#include &lt;iostream&gt;
#include &lt;sstream&gt;
#include &lt;stdio.h&gt;
#include &lt;stdlib.h&gt;
#include &lt;string&gt;
#include &lt;sys/stat.h&gt;
#include &lt;unistd.h&gt;
#include &lt;algorithm&gt;
#include &lt;fstream&gt;
#include &lt;map&gt;
#include &lt;math.h&gt;
#include &lt;fcntl.h&gt;


#include &quot;431project.h&quot;


using namespace std;

/*
 * Not all configurations are inherently valid. (For example, L1 &gt; L2). 
 * Returns 1 if valid, else 0.
 */
int validateConfiguration(std::string configuration){
  // is the configuration at least describing 18 integers/indices?
  if (isan18dimconfiguration(configuration) != 1)
    return 0;

  // if it is, lets convert it to an array of ints for use below
  int configurationDimsAsInts[18];
  int returnValue = 1;  // assume true, set 0 if otherwise
  extractConfiguration(configuration, configurationDimsAsInts); // Configuration parameters now available in array
    
  // 
  // FIXME - YOUR VERIFICATION CODE HERE 
  // ...

  int widthV = 1 &lt;&lt; configurationDimsAsInts[0];
  int fetchspeedV = 1 &lt;&lt; configurationDimsAsInts[1];
  int schedulingV = configurationDimsAsInts[2];
  int ruusizeV = 1 &lt;&lt; (configurationDimsAsInts[3] + 2);
  int lsqsizeV = 1 &lt;&lt; (configurationDimsAsInts[4] + 2);
  int memportV = 1 &lt;&lt; configurationDimsAsInts[5];

  int L1D_setsV = 32 &lt;&lt; configurationDimsAsInts[6];
  int L1D_waysV = 1 &lt;&lt; configurationDimsAsInts[7];
  int L1I_setsV = 32 &lt;&lt; configurationDimsAsInts[8];
  int L1I_waysV = 1 &lt;&lt; configurationDimsAsInts[9];
    
  //helpers
  int L1_blksizeV = widthV * 8;
  unsigned L1D_sizeV = L1D_setsV * L1D_waysV * L1_blksizeV;
  unsigned L1I_sizeV = L1I_setsV * L1I_waysV * L1_blksizeV;

  int L2_setsV = 256 &lt;&lt; configurationDimsAsInts[10];
  int L2_blksizeV = 16 &lt;&lt; configurationDimsAsInts[11]; //bytes
  int L2_waysV = 1 &lt;&lt; configurationDimsAsInts[12];

  unsigned L2_sizeV  = L2_setsV  * L2_blksizeV * L2_waysV;


  int tlb_sets = 4 &lt;&lt; configurationDimsAsInts[13];

  int L1D_latency =configurationDimsAsInts[14] + 1;
  int L1I_latency =configurationDimsAsInts[15] + 1;
  int L2_latency =configurationDimsAsInts[16] + 5;

  int bp = configurationDimsAsInts[17];

  //basic limiters

  if(widthV &lt; 1|| fetchspeedV &lt; 1 || schedulingV&lt; 0 || ruusizeV &lt; 4 || lsqsizeV &lt; 4 || memportV &lt;1 || L1D_setsV &lt; 32 || L1D_waysV &lt; 1 
    || L1I_setsV &lt; 32 || L1I_waysV &lt; 1 || L2_setsV &lt; 256 ||L2_blksizeV &lt; 16 || L2_waysV &lt; 1 || tlb_sets &lt; 4 || L1D_latency &lt; 1 
    || L1I_latency &lt; 1 || L2_latency &lt; 5 ||bp &lt; 0){
      return 0;
  }
    
  if (widthV &gt; 8|| fetchspeedV &gt; 2 || schedulingV&gt; 1 || ruusizeV &gt; 128 || lsqsizeV &gt; 32 || memportV &gt;2 || L1D_setsV &gt; 8192 
    || L1D_waysV &gt; 4 || L1I_setsV &gt; 8192 || L1I_waysV &gt; 4 || L2_setsV &gt; 131072 ||L2_blksizeV &gt; 128 || L2_waysV &gt; 16 || tlb_sets &gt; 64 
    || L1D_latency &gt; 7 || L1I_latency &gt; 7 || L2_latency &gt; 13 ||bp &gt; 5){
      return 0;
  }

  //L2 must be bigger than:
  //both L1 caches
  //twice as big as L1 
  else if(L2_sizeV &lt; (L1D_sizeV + L1I_sizeV) || (L2_blksizeV &lt; (2*L1_blksizeV ))){
    return 0;
  }

  //L1D
  int t = 0, n = 0;
  if(L1D_sizeV == 8*1024){
    t = 1;
  }
  else if(L1D_sizeV == 16*1024){
    t = 2;
  }
  else if(L1D_sizeV == 32*1024){
    t = 3;
  }
  else if(L1D_sizeV == 64*1024){
    t = 4;
  }
  else{
    return 0;
  }
  if(L1D_waysV == 2){
    n = 1;
  }
  else if(L1D_waysV == 4){
    n = 2;
  }
  if(L1D_latency != t + n){
    return 0;
  }

  t = 0;
  n = 0;

  //L1I
  if(L1I_sizeV == 8*1024){
    t = 1;
  }
  else if(L1I_sizeV == 16*1024){
    t = 2;
  }
  else if(L1I_sizeV == 32*1024){
    t = 3;
  }
  else if(L1I_sizeV == 64*1024){
    t = 4;
  }
  else{
    return 0;
  }
  if(L1I_waysV == 2){
    n = 1;
  }
  else if(L1I_waysV == 4){
    n = 2;
  }
  if(L1I_latency != t + n){
    return 0;
  }

  t = 0;
  n = 0;

  //L2
  if(L2_sizeV == 128*1024){
    t = 7;
  }
  else if(L2_sizeV == 256*1024){
    t = 8;
  }
  else if(L2_sizeV == 512*1024){
    t = 9;
  }
  else if(L2_sizeV == 1024*1024){
    t = 10;
  }
  else if(L2_sizeV == 2048*1024){
    t = 11;
  }
  else{
    return 0;
  }
  if(L2_waysV == 1){
    n = -2;
  }
  else if(L2_waysV == 2){
    n = -1;
  }
  else if(L2_waysV == 4){
    n = 0;
  }
  else if(L2_waysV == 8){
    n = 1;
  }
  else if(L2_waysV == 16){
    n = 2;
  }
  if(L2_latency != t + n){
    return 0;
  }

  if(widthV &gt; 2 * fetchspeedV || tlb_sets * 4 &gt; 512){
    return 0;
  }
return returnValue;
}



/*
 * Given the current best known configuration for a particular optimization, 
 * the current configuration, and using globally visible map of all previously 
 * investigated configurations, suggest a new, previously unexplored design 
 * point. You will only be allowed to investigate 1000 design points in a 
 * particular run, so choose wisely. Using the optimizeForX variables,
 * propose your next configuration provided the optimiztion strategy.
 */
std::string YourProposalFunction(
  std::string currentconfiguration,
  std::string bestED2Pconfiguration,
  std::string bestEDPconfiguration,
  std::string bestEDAPconfiguration,
  std::string bestED2APconfiguration,
  int optimizeforED2P,
  int optimizeforEDP,
  int optimizeforEDAP,
  int optimizeforED2AP
){
  /*
  * REPLACE THE BELOW CODE WITH YOUR PROPOSAL FUNCTION
  *
  * The proposal function below is extremely unintelligent and
  * will produce configurations that, while properly formatted, 
  * violate specified project constraints
  */    
  
  // produces an essentially random proposal
  int configuration[18];

  extractConfiguration(currentconfiguration, configuration);

  static int DIM_index = 0; // to remember value across different calls
  int dimV = DIM_index;
  DIM_index = (DIM_index + 1) %18; //rotates through each of the 18 dimensions

  int validChoices = GLOB_dimensioncardinality[dimV];

  //iteration 4

  if(optimizeforED2P){
    configuration[dimV] = (configuration[dimV] + 1) %validChoices; 
    configuration[0] = (rand() %2 ) + 2; // width being very large
    configuration[1] = 1; //fetch speed
    configuration[2] = 1; //scheduling OoO
  }
  else if(optimizeforEDP){
    configuration[dimV] = (configuration[dimV] +(validChoices/2) - 1) %validChoices; 
  }
  else if(optimizeforEDAP){
    configuration[dimV] = (configuration[dimV] + 1) %validChoices;
    configuration[0] = 0;
    configuration[1] = 1; //fetch speed
    configuration[2] = 0; //scheduling in order
    //configuration[dimV] = (configuration[dimV] +(validChoices/2) - 1) %validChoices; 
    //iteration 5
    //configuration[dimV] = rand()% (validChoices/ 2 + 1);

  }
  else if(optimizeforED2AP){
    for(int dimV = 0; dimV &lt; 18; dimV++){
      configuration[dimV] = rand() % GLOB_dimensioncardinality[dimV];
    }
  }
  else{
    //not possible
  }

  //iteration 2
  //generating neighbor
  //configuration[dimV] = (configuration[dimV] + 1) %validChoices; // rotates through each of the index in specified dimension

  string tempConfig = compactConfiguration(configuration);



  //added this in my third iteration of my propossal function
  if(validateConfiguration(tempConfig) == 0){
    int retreatedConfiguration[18];
    string newConfig = "";

    while(true){
      for(int i = 0; i &lt; 18; i++){
        retreatedConfiguration[i] = rand() % GLOB_dimensioncardinality[i];
      }
      newConfig = compactConfiguration(retreatedConfiguration);
      if(validateConfiguration(newConfig)){ // if new random config passes
        break;
      }
    }


    tempConfig = newConfig;
  }


  return tempConfig;
}
</code></pre>
    </details>
    `
  },
  {
    kind: 'project',
    slug: 'pipelined-mips-cpu-5-stage',
    title: 'Pipelined MIPS CPU (5‑stage)',
    description: 'Hazard detection/forwarding, branch prediction; verified with waveform suites in Vivado.',
    course: 'ECE 350',
    term: 'Fall 2024',
    link: '#'
  },
  {
    kind: 'project',
    slug: 'audio-amplifier-circuit',
    title: 'Audio Amplifier Circuit',
    contentHtml: `
      <h2 id="introduction">Introduction</h2>
      <div class="intro-with-video" style="overflow: hidden;">
        <figure class="intro-video right vertical" style="float: right; margin: 0 0 1rem 1.25rem;">
          <video controls playsinline muted style="aspect-ratio: 9/16; width: 260px; max-width: 40vw; height: auto; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.18); display: block;">
            <source src="/academics/audio-amplifier/demo.mp4" type="video/mp4" />
            <source src="/academics/audio-amplifier/demo.mov" type="video/quicktime" />
            Sorry, your browser doesn't support embedded videos.
          </video>
          <figcaption>LEDs reacting live while music plays (vertical video).</figcaption>
        </figure>
        <p>This project was about building a small audio system from scratch that could take in music, shape the sound, display the volume on LEDs, and play it through a speaker. To achieve this, I designed and implemented a five-stage audio processing chain: a summing op-amp mixer, a tone control filter, a volume control stage, an LED-based volume indicator, and a fixed-gain power amplifier. The system accepts a stereo input, converts it to mono, adjusts the tone and volume, shows a real-time visual indication of signal amplitude, and drives a speaker output. Each stage was built with discrete components — op-amps, resistors, capacitors, and transistors — and was tested individually before integration into the complete system.</p>
        <ul class="intro-tags" aria-label="Tags" style="list-style: none; padding: 0; margin: 0.5rem 0 0; display: flex; flex-wrap: wrap; gap: 0.5rem;">
          <li style="padding: 0.35rem 0.7rem; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); font-size: 0.85rem; line-height: 1;">Analog</li>
          <li style="padding: 0.35rem 0.7rem; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); font-size: 0.85rem; line-height: 1;">Op‑amp</li>
          <li style="padding: 0.35rem 0.7rem; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); font-size: 0.85rem; line-height: 1;">RC filter</li>
          <li style="padding: 0.35rem 0.7rem; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); font-size: 0.85rem; line-height: 1;">Summing mixer</li>
          <li style="padding: 0.35rem 0.7rem; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); font-size: 0.85rem; line-height: 1;">Volume control</li>
          <li style="padding: 0.35rem 0.7rem; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); font-size: 0.85rem; line-height: 1;">LED VU</li>
          <li style="padding: 0.35rem 0.7rem; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); font-size: 0.85rem; line-height: 1;">Power amp</li>
          <li style="padding: 0.35rem 0.7rem; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); font-size: 0.85rem; line-height: 1;">TIP31/TIP32</li>
          <li style="padding: 0.35rem 0.7rem; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); font-size: 0.85rem; line-height: 1;">Breadboard</li>
        </ul>
      </div>

  <div style="clear: both;"></div>
  <h2 id="system-overview">System Overview</h2>
      <p>The audio pipeline was divided into functional blocks, each contributing a critical role:</p>
      <ol>
        <li><strong>Mixing (Block 1)</strong> – A summing op-amp combined stereo left/right channels into a single mono output, with potentiometers to independently control each channel’s contribution.</li>
        <li><strong>Tone Control (Block 2)</strong> – A potentiometer-controlled filter modified frequency response between 20 Hz and 20 kHz, boosting bass while attenuating treble or the reverse.</li>
        <li><strong>Volume Control (Block 3)</strong> – A 20 kΩ potentiometer configured as a voltage divider provided continuous volume adjustment from zero to full scale.</li>
        <li><strong>LED Volume Indicator (Block 4)</strong> – A four-level comparator circuit used reference voltages to light LEDs in sequence, functioning as a visual VU meter.</li>
        <li><strong>Power Amplifier (Block 5)</strong> – A fixed-gain amplifier built with TIP31 (NPN) and TIP32 (PNP) transistors delivered the necessary current to drive a speaker.</li>
      </ol>

      <figure class="block-diagram">
        <svg viewBox="0 0 900 160" role="img" aria-label="Block diagram: L/R inputs → Mixer → Tone → Volume → (split) LED VU and Power Amp → Speaker">
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="currentColor" />
            </marker>
          </defs>
          <g fill="none" stroke="currentColor" stroke-width="2">
            <text x="10" y="30">L</text>
            <text x="10" y="60">R</text>
            <line x1="30" y1="25" x2="90" y2="25" marker-end="url(#arrow)" />
            <line x1="30" y1="55" x2="90" y2="55" marker-end="url(#arrow)" />
            <rect x="90" y="20" width="120" height="50" rx="8"/>
            <text x="150" y="50" text-anchor="middle">Mixer</text>
            <line x1="210" y1="45" x2="300" y2="45" marker-end="url(#arrow)" />
            <rect x="300" y="20" width="120" height="50" rx="8"/>
            <text x="360" y="50" text-anchor="middle">Tone</text>
            <line x1="420" y1="45" x2="510" y2="45" marker-end="url(#arrow)" />
            <rect x="510" y="20" width="120" height="50" rx="8"/>
            <text x="570" y="50" text-anchor="middle">Volume</text>
            <line x1="630" y1="45" x2="720" y2="45" />
            <line x1="675" y1="45" x2="675" y2="110" />
            <line x1="675" y1="110" x2="760" y2="110" marker-end="url(#arrow)" />
            <rect x="760" y="85" width="120" height="50" rx="8"/>
            <text x="820" y="115" text-anchor="middle">LED VU</text>
            <line x1="720" y1="45" x2="810" y2="45" marker-end="url(#arrow)" />
            <rect x="810" y="20" width="120" height="50" rx="8"/>
            <text x="870" y="50" text-anchor="middle">Power Amp</text>
          </g>
        </svg>
        <figcaption>Signal flow from stereo inputs to speaker, with a parallel tap to the LED VU meter.</figcaption>
      </figure>

      <figure class="overview-photo">
        <img src="/academics/audio-amplifier/breadboard-overview.jpg" alt="Breadboard overview of the full audio chain" />
        <figcaption>Full breadboard build — neat wiring and short returns help keep noise low.</figcaption>
      </figure>

      <h2 id="design-process">Design Process</h2>
      <p>Each block was designed, simulated, and validated individually before integration.</p>
      <h3 id="block-1">Block 1 — Summing Mixer</h3>
      <p>A classic inverting summing amplifier mixes left/right into mono. Gains were set by choosing input resistors against the feedback resistor to keep headroom and low noise.</p>
      <figure>
        <img src="/academics/audio-amplifier/block1-mixer.jpg" alt="Summing amplifier stage on breadboard" />
        <figcaption>Summing mixer: left/right pots control contribution before summing.</figcaption>
      </figure>

      <h3 id="block-2">Block 2 — Tone Control</h3>
      <p>A potentiometer-controlled RC network shapes the response between ~20 Hz and 20 kHz, giving musical bass/treble tilt without clipping.</p>
      <figure>
        <img src="/academics/audio-amplifier/block2-tone.jpg" alt="Tone control RC network with potentiometer" />
        <figcaption>Tilt EQ: sweep tested on the scope to confirm frequency shaping.</figcaption>
      </figure>

      <h3 id="block-3">Block 3 — Volume</h3>
      <p>A 20 kΩ potentiometer configured as a divider provides smooth volume from mute to full-scale; output impedance remains low into the next stage.</p>
      <figure>
        <img src="/academics/audio-amplifier/block3-volume.jpg" alt="Volume control potentiometer wiring" />
        <figcaption>Volume pot wiring and measured taper behavior.</figcaption>
      </figure>

      <h3 id="block-4">Block 4 — LED Volume Indicator</h3>
      <p>Four comparators check the signal against references (~20 mV, 60 mV, 80 mV, 120 mV). LEDs light progressively, forming a simple VU meter.</p>
      <figure>
        <img src="/academics/audio-amplifier/block4-leds.jpg" alt="Comparator-based LED volume indicator" />
        <figcaption>LED VU: reference ladder from the 9 V rail and matched resistors.</figcaption>
      </figure>

      <h3 id="block-5">Block 5 — Power Amplifier</h3>
      <p>A complementary emitter follower using TIP31/TIP32 provides current to the speaker at a fixed gain. Biasing avoids crossover distortion while protecting the op-amp.</p>
      <figure>
        <img src="/academics/audio-amplifier/block5-amp.jpg" alt="Power amplifier stage with TIP31/TIP32" />
        <figcaption>Power stage layout with heat dissipation and short speaker leads.</figcaption>
      </figure>

      <details>
        <summary>Bill of Materials (expand)</summary>
        <ul>
          <li>Op-amp(s), TIP31/TIP32, assorted resistors/caps, 20 kΩ pots (×2), LEDs (×4), 9 V supply</li>
          <li>Breadboard, jumpers, 8 Ω speaker, audio jack(s)</li>
        </ul>
      </details>

      <h2 id="results">Results</h2>
      <ul>
        <li>Stereo signals were mixed into a stable mono channel.</li>
        <li>Tone control produced clear bass and treble adjustments.</li>
        <li>The volume control stage provided smooth, reliable output scaling.</li>
        <li>The LED indicator responded dynamically to signal amplitude, creating a real-time visual representation of the music.</li>
        <li>The amplifier stage drove the speaker effectively at normal listening levels.</li>
      </ul>
      <figure>
        <img src="/academics/audio-amplifier/scope-output.png" alt="Oscilloscope output at the speaker terminals" />
        <figcaption>Measured output waveform under load — clean sinusoid within target swing.</figcaption>
      </figure>
      <h2 id="challenges">Challenges &amp; Lessons Learned</h2>
      <ul>
        <li>Component tolerances affected gain and filter accuracy — tune using measured values, not only calculations.</li>
        <li>Breadboard noise underscored the importance of star grounds and short returns for analog stages.</li>
        <li>Integration matters: simple blocks become powerful when combined thoughtfully.</li>
      </ul>
      <h2 id="reflection">Reflection</h2>
      <p>This project demonstrated the fundamentals of system-level circuit design: combining mixing, filtering, control, indication, and amplification into one functioning chain. It reinforced the importance of testing at every stage, understanding real-world deviations from theory, and considering user interaction (knobs, LEDs, speaker output) as part of the design. If extended, the system could be upgraded with a microphone input, digital tone controls, and a microcontroller-driven display for a more modern interface.</p>
      
    `
  },
  {
    kind: 'assignment',
    slug: 'allocator-from-scratch',
    title: 'Allocator from Scratch',
    description: 'Buddy allocator in C with coalescing; unit tests and perf harness.',
    course: 'CS 341 (OS)',
    term: 'Fall 2024',
    link: '#'
  },
  
]

export function getAcademicBySlug(slug: string): AcademicItem | undefined {
  return featuredAcademics.find(a => a.slug === slug)
}
