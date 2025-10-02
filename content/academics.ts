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
    description: 'A 32‑bit pipelined MIPS processor with hazards resolved via forwarding & stalls.',
    course: 'ECE 350',
    term: 'Fall 2024',
    hero: {
        // Updated to academics path (ensure the file is moved to /public/academics/pipelined-mips-cpu-5-stage/)
        src: '/academics/pipelined-mips-cpu-5-stage/5stagepipelineiconimage.png',
      alt: 'Five stage pipeline datapath overview',
      width: 1600,
      height: 900
    },
    contentHtml: `
  <h2>Overview</h2>
  <p>I built a small computer processor. It runs in five staged steps and can process multiple instructions at the same time. Formally, it is a 32‑bit MIPS‑style CPU implemented in Verilog with the classic <em>five‑stage pipeline</em> (IF, ID, EX, MEM, WB). Correctness and throughput are maintained by a hazard detection unit that inserts stalls when required and a forwarding network that supplies the most recent values to the ALU inputs.</p>

  <h2>Highlights</h2>
  <ul>
    <li>Five‑stage pipeline: IF → ID → EX → MEM → WB</li>
    <li>Data forwarding on both ALU operands (EX/MEM and MEM/WB sources)</li>
    <li>Load‑use hazard detection with single‑cycle stall insertion</li>
    <li>32‑bit datapath and register file (2R/1W), negative‑edge write timing</li>
    <li>Instruction subset: R‑type add/sub, <code>lw</code>, <code>sw</code></li>
    <li>Modular Verilog design with clear pipeline registers and control separation</li>
  </ul>

  <h2>Microarchitecture</h2>
  <figure class="not-prose">
    <svg viewBox="0 0 920 200" width="100%" role="img" aria-label="Five-stage pipeline with forwarding paths">
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto" markerUnits="strokeWidth">
          <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
        </marker>
      </defs>
      <g fill="none" stroke="currentColor" stroke-width="2">
        <rect x="30" y="60" width="140" height="60" rx="8"></rect>
        <text x="100" y="95" text-anchor="middle">IF</text>
        <rect x="210" y="60" width="140" height="60" rx="8"></rect>
        <text x="280" y="95" text-anchor="middle">ID</text>
        <rect x="390" y="60" width="140" height="60" rx="8"></rect>
        <text x="460" y="95" text-anchor="middle">EX</text>
        <rect x="570" y="60" width="140" height="60" rx="8"></rect>
        <text x="640" y="95" text-anchor="middle">MEM</text>
        <rect x="750" y="60" width="140" height="60" rx="8"></rect>
        <text x="820" y="95" text-anchor="middle">WB</text>

        <!-- stage pipes -->
        <line x1="170" y1="90" x2="210" y2="90" marker-end="url(#arrowhead)" />
        <line x1="350" y1="90" x2="390" y2="90" marker-end="url(#arrowhead)" />
        <line x1="530" y1="90" x2="570" y2="90" marker-end="url(#arrowhead)" />
        <line x1="710" y1="90" x2="750" y2="90" marker-end="url(#arrowhead)" />

        <!-- forwarding A/B (schematic) -->
        <path d="M 640 60 C 640 20, 460 20, 460 60" stroke="currentColor" marker-end="url(#arrowhead)" />
        <path d="M 820 60 C 820 10, 460 10, 460 60" stroke="currentColor" marker-end="url(#arrowhead)" />
        <path d="M 640 120 C 640 160, 460 160, 460 120" stroke="currentColor" marker-end="url(#arrowhead)" />
        <path d="M 820 120 C 820 170, 460 170, 460 120" stroke="currentColor" marker-end="url(#arrowhead)" />
      </g>
      <g fill="currentColor" font-size="12">
        <text x="455" y="40" text-anchor="middle">MEM → EX (forward)</text>
        <text x="455" y="24" text-anchor="middle">WB → EX (forward)</text>
        <text x="455" y="152" text-anchor="middle">MEM → EX (forward)</text>
        <text x="455" y="176" text-anchor="middle">WB → EX (forward)</text>
      </g>
    </svg>
    <figcaption>Five‑stage pipeline with schematic forwarding paths from MEM/WB back to EX operands.</figcaption>
        <li><strong>IF — Instruction Fetch:</strong> The program counter (PC) addresses instruction memory; <code>pc_adder</code> advances the PC by 4.</li>
        <li><strong>ID — Decode and Register Read:</strong> The control unit derives control signals; the register file provides <code>rs</code> and <code>rt</code>; immediates are sign‑extended.</li>
        <li><strong>EX — Execute:</strong> The ALU performs arithmetic (add/sub). The write‑back register (rt vs. rd) is selected, and forwarded operands may be chosen.</li>
        <li><strong>MEM — Data Memory:</strong> Load and store instructions access data memory using the ALU result as the address.</li>
        <li><strong>WB — Write‑Back:</strong> The ALU or memory result is committed to the register file.</li>
      </ol>

      <h2>Hazard handling</h2>
      <table>
        <thead>
          <tr>
            <th>Hazard</th>
            <th>Condition</th>
            <th>Resolution</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>EX data</td>
            <td>Producer in MEM/WB, consumer in EX</td>
            <td>Forward via <code>forward_reg</code> (select EX/MEM or MEM/WB result)</td>
          </tr>
          <tr>
            <td>Load‑use</td>
            <td><code>lw</code> in EX, dependent consumer in ID</td>
            <td><code>hazard_reg</code> asserts <code>stall</code>, inserts 1 bubble</td>
          </tr>
          <tr>
            <td>RF timing</td>
            <td>Read/Write same cycle</td>
            <td>RF writes on negedge; reads are combinational</td>
          </tr>
        </tbody>
      </table>

      <h2>Pipeline timing example</h2>
      <p>A short trace showing a single‑cycle stall on a load‑use dependency followed by forwarding:</p>
      <div class="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Instr</th>
              <th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>I1: lw r1, 0(r2)</td><td>IF</td><td>ID</td><td>EX</td><td>MEM</td><td>WB</td><td></td><td></td></tr>
            <tr><td>I2: add r3, r1, r4</td><td></td><td>IF</td><td>ID</td><td>STALL</td><td>EX*</td><td>MEM</td><td>WB</td></tr>
            <tr><td>I3: sw r3, 4(r5)</td><td></td><td></td><td>IF</td><td>ID</td><td>EX*</td><td>MEM</td><td>WB</td></tr>
          </tbody>
        </table>
      </div>
      <p><em>EX* indicates operands supplied via forwarding (from MEM/WB or EX/MEM as appropriate).</em></p>

      <h2>Correctness and performance mechanisms</h2>
      <ul>
        <li><strong>Data hazards:</strong> The <code>forward_reg</code> unit selects among ID/EX operands, MEM results, or WB results for each ALU input (<em>forwardA</em> and <em>forwardB</em>), ensuring the ALU receives the most recent values.</li>
        <li><strong>Load‑use hazards:</strong> The <code>hazard_reg</code> unit asserts <code>stall</code> when an instruction in EX is a load and the following instruction requires the loaded value in the next cycle.</li>
        <li><strong>Register file timing:</strong> Writes occur on the negative clock edge and reads are combinational to avoid read‑write conflicts within a cycle.</li>
      </ul>

      <h2>Design decisions</h2>
      <ul>
        <li>Pipeline registers carry only the fields needed by downstream stages, minimizing fan‑out and simplifying control.</li>
        <li>Forwarding muxes are 3‑way (ID/EX, EX/MEM, MEM/WB), eliminating unnecessary bubbles for ALU‑ALU dependencies.</li>
        <li>Single‑cycle data memory keeps the MEM stage simple; <code>lw</code> is the only case that forces a bubble on immediate use.</li>
      </ul>

      <h2>Architectural components</h2>
      <ul>
        <li>Pipeline registers: <code>if_id</code>, <code>id_ex</code>, <code>ex_mem</code>, <code>mem_wb</code></li>
        <li>Instruction set slice: R‑type add/sub, <code>lw</code>, <code>sw</code></li>
        <li>Modules: <code>program_counter</code>, <code>pc_adder</code>, <code>inst_mem</code>, <code>register_file</code>, <code>control_unit</code>, <code>imm_extend</code>, <code>alu</code>, <code>data_mem</code>, muxes (2×1, 3×1)</li>
        <li>Verification: Simulated with a small instruction/data memory; waveforms confirm forwarding decisions and stall timing.</li>
      </ul>

  <h2>Example execution</h2>
  <p>The bundled program sequence loads two words, performs an addition, and introduces a dependent load to exercise a single‑cycle stall followed by forwarding. The waveforms illustrate the asserted <code>stall</code> and the subsequent selection of forwarded operands.</p>

  <h2>Source code</h2>
  <p>The complete Verilog source is available below. No files download automatically; use the provided buttons to access the material.</p>
      <div class="not-prose mt-2 flex flex-wrap gap-2">
        <a href="/academics/pipelined-mips-cpu-5-stage/datapath.v" download class="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10">Download datapath.v</a>
        <a href="/academics/pipelined-mips-cpu-5-stage/datapath.v" target="_blank" rel="noopener noreferrer" class="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10">Open in new tab</a>
      </div>
    `
  },
  {
    kind: 'project',
    slug: 'audio-amplifier-circuit',
    title: 'Audio Amplifier Circuit',
  description: 'Audio amplifier with treble, bass and volume control',
    contentHtml: `
      <h2 id="introduction">Introduction</h2>
      <div class="intro-with-video" style="overflow: hidden;">
        <figure class="intro-video right vertical" style="float: right; margin: 0 0 1rem 1.25rem;">
          <video id="amplifier-demo" data-primary="/academics/audio-amplifier-circuit/audiohero.mp4" data-alt="/academics/audio-amplifier-circuit/audiohero2.mp4" data-current="primary" autoplay loop controls playsinline muted preload="auto" style="aspect-ratio: 9/16; width: 360px; max-width: 50vw; height: auto; border-radius: 14px; box-shadow: 0 10px 28px rgba(0,0,0,0.28); display: block;">
            <source src="/academics/audio-amplifier-circuit/audiohero.mp4" type="video/mp4" />
            Sorry, your browser doesn't support embedded videos.
          </video>
          <div style="margin-top:.4rem; display:flex; gap:.5rem; flex-wrap:wrap; align-items:center;">
            <figcaption style="margin:0;">Enable audio to hear music.</figcaption>
            <button id="amplifier-toggle" type="button" style="cursor:pointer; font-size:.65rem; letter-spacing:.4px; padding:.45rem .75rem; border-radius:999px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.18); backdrop-filter:blur(6px); transition:background .25s;">
              Switch to Alt Video
            </button>
          </div>
          <script>
            // Attempt to unmute after autoplay starts (browser will block only if no gesture and policy disallows)
            (function(){
              const v = document.getElementById('amplifier-demo');
              if(!v) return;
              const tryUnmute = () => {
                try {
                  v.muted = false;
                  const p = v.play();
                  if(p) p.catch(()=>{/* ignore if blocked */});
                } catch(e) {}
              };
              if (document.readyState === 'complete' || document.readyState === 'interactive') {
                setTimeout(tryUnmute, 300);
              } else {
                document.addEventListener('DOMContentLoaded', () => setTimeout(tryUnmute, 300));
              }
              // Fallback: on first user interaction force unmute
              const userEvents = ['click','touchstart','keydown'];
              const onUser = () => { tryUnmute(); userEvents.forEach(ev=>window.removeEventListener(ev,onUser)); };
              userEvents.forEach(ev=>window.addEventListener(ev,onUser,{once:true}));
              // Toggle button logic
              const btn = document.getElementById('amplifier-toggle');
              if(btn){
                btn.addEventListener('click', () => {
                  try {
                    const current = v.getAttribute('data-current') || 'primary';
                    const next = current === 'primary' ? 'alt' : 'primary';
                    const nextSrc = v.dataset[next];
                    if(!nextSrc) return;
                    // Remove existing <source> elements
                    Array.from(v.querySelectorAll('source')).forEach(s => s.remove());
                    const sEl = document.createElement('source');
                    sEl.src = nextSrc;
                    sEl.type = 'video/mp4';
                    v.appendChild(sEl);
                    v.setAttribute('data-current', next);
                    v.pause();
                    v.load();
                    const p = v.play(); if(p) p.catch(()=>{});
                    btn.textContent = next === 'primary' ? 'Switch to Alt Video' : 'Switch to Original';
                  } catch(e){/* noop */}
                });
              }
            })();
          </script>
        </figure>
        <p>This system processes audio sources and adjusts them with volume, bass, and treble controls. Bright LED indicators show the audio levels, while a connected speaker plays back your changes instantly. 
        <br><br>
        To achieve this, I designed and implemented a five-stage audio processing chain: a summing op-amp mixer, a tone control filter, a volume control stage, an LED-based volume indicator, and a fixed-gain power amplifier. The system accepts a stereo input, converts it to mono, adjusts the tone and volume, shows a real-time visual indication of signal amplitude, and drives a speaker output. Each stage was built using individual components such as op-amps, resistors, capacitors, and transistors, and was individually tested with an oscilloscope before integration into the complete system.</p>
        <ul class="intro-tags" aria-label="Tags" style="list-style: none; padding: 0; margin: 0.5rem 0 0; display: flex; flex-wrap: wrap; gap: 0.5rem;">
          <li style="padding: 0.35rem 0.7rem; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); font-size: 0.85rem; line-height: 1;">Op‑amp mixing</li>
          <li style="padding: 0.35rem 0.7rem; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); font-size: 0.85rem; line-height: 1;">Tone filtering</li>
          <li style="padding: 0.35rem 0.7rem; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); font-size: 0.85rem; line-height: 1;">Frequency analysis</li>
          <li style="padding: 0.35rem 0.7rem; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); font-size: 0.85rem; line-height: 1;">Potentiometer</li>
          <li style="padding: 0.35rem 0.7rem; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); font-size: 0.85rem; line-height: 1;">Signal visualization</li>
          <li style="padding: 0.35rem 0.7rem; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); font-size: 0.85rem; line-height: 1;">Mono conversion</li>
          <li style="padding: 0.35rem 0.7rem; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); font-size: 0.85rem; line-height: 1;">Oscilloscope testing</li>
          <li style="padding: 0.35rem 0.7rem; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); font-size: 0.85rem; line-height: 1;">Schematic drafting</li>
          <li style="padding: 0.35rem 0.7rem; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); font-size: 0.85rem; line-height: 1;">Breadboarding</li>
        </ul>
      </div>

  <!-- local styles for image formatting in this page only -->
  <style>
    .amp-fig{margin:1.5rem auto; text-align:center; max-width:900px;}
    .amp-fig figcaption{font-size:.7rem; letter-spacing:.3px; opacity:.7; margin-top:.45rem;}
    .amp-wide{display:block; margin:0 auto; width:100%; max-width:900px; border-radius:14px;}
    .amp-block-img{display:block; margin:0.75rem auto 0; max-width:420px; width:100%; border-radius:10px; box-shadow:0 4px 18px -6px rgba(0,0,0,0.4);}
    /* invert white-background block images so they harmonize with dark theme */
    .amp-invert{filter:invert(1) hue-rotate(180deg) saturate(.4) brightness(1.1) contrast(1.05);}
    @media (min-width:1100px){ .amp-block-img{max-width:460px;} }
    /* compact block gallery */
    .amp-block-grid{display:grid; gap:1.25rem; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); align-items:start; margin:1rem 0 2.25rem;}
    .amp-block-card{background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); padding:0.75rem 0.75rem 1rem; border-radius:16px; box-shadow:0 4px 18px -8px rgba(0,0,0,0.5);}
    .amp-block-card figure{margin:0 0 .35rem;}
    .amp-block-card summary{cursor:pointer; font-weight:600; letter-spacing:.3px; font-size:.8rem;}
    .amp-block-card details{margin-top:.25rem; font-size:.72rem; line-height:1.3;}
    .amp-block-card p{margin:.4rem 0 0;}
    .amp-block-card .amp-block-img{max-width:100%; box-shadow:none;}
    /* refinement: better alignment & larger cards */
    .amp-block-grid{max-width:1400px; margin:1.4rem auto 3rem; gap:2rem; grid-template-columns:repeat(auto-fill,minmax(300px,1fr));}
    .amp-block-card{padding:1.15rem 1.15rem 1.35rem; border-radius:22px; display:flex; flex-direction:column; height:100%;}
    .amp-block-card .amp-fig{max-width:none; margin:0 0 .65rem;}
    .amp-block-card figure{background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.08); border-radius:18px; padding:1rem 1rem .85rem; display:flex; flex-direction:column; justify-content:flex-start; min-height:250px;}
    .amp-block-card .amp-block-img{margin:.15rem auto 0; max-width:92%; max-height:200px; object-fit:contain;}
    .amp-block-label{font-size:.8rem; font-weight:600; letter-spacing:.4px; text-align:center; margin:0 0 .4rem;}
    .amp-block-card figcaption{margin-top:.65rem; font-size:.68rem; opacity:.7; line-height:1.35;}
    @media (min-width:900px){
      .amp-block-card figure{min-height:280px;}
      .amp-block-card .amp-block-img{max-height:230px;}
      .amp-block-label{font-size:.85rem;}
    }
    @media (min-width:1400px){
      .amp-block-grid{grid-template-columns:repeat(auto-fill,minmax(320px,1fr));}
      .amp-block-card figure{min-height:300px;}
      .amp-block-card .amp-block-img{max-height:250px;}
    }
    /* breadboard overview sizing */
    .amp-breadboard{max-width:680px; margin:1.25rem auto 1.75rem;}
    .amp-breadboard-img{display:block; width:100%; max-width:620px; margin:0 auto; border-radius:14px; box-shadow:0 4px 22px -6px rgba(0,0,0,0.45);}    
    /* oscilloscope results layout */
    .scope-grid{display:grid; gap:1.75rem; margin:1.5rem 0 2.5rem; grid-template-columns:repeat(auto-fit,minmax(320px,1fr));}
    .scope-fig{background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.08); padding:1rem 1rem .9rem; border-radius:18px; box-shadow:0 4px 18px -8px rgba(0,0,0,.55); display:flex; flex-direction:column;}
    .scope-fig img{width:100%; height:auto; border-radius:10px; background:#111; object-fit:contain; box-shadow:0 4px 22px -8px rgba(0,0,0,.6);}
    .scope-fig figcaption{margin-top:.55rem; font-size:.63rem; line-height:1.35; opacity:.82; letter-spacing:.3px;}
    .scope-label{font-size:.8rem; font-weight:600; letter-spacing:.4px; margin:0 0 .55rem; text-align:center;}
    .scope-pair{display:grid; gap:1rem;}
    .scope-mini{font-size:.6rem; opacity:.65; margin-top:.4rem;}
    /* collapsible blocks + automatic figure numbering */
    .scope-block{margin:2.25rem 0 2.75rem; border:1px solid rgba(255,255,255,0.08); border-radius:22px; padding:1.1rem 1.15rem 1.4rem; background:linear-gradient(145deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015)); box-shadow:0 6px 28px -12px rgba(0,0,0,.55);}
    .scope-block>summary{cursor:pointer; list-style:none; font-weight:600; font-size:1rem; letter-spacing:.4px; margin:0 0 .85rem; position:relative; padding-left:1.4rem;}
    .scope-block>summary::-webkit-details-marker{display:none;}
    .scope-block>summary:before{content:'▸'; position:absolute; left:0; top:0; transition:transform .25s ease;}
    .scope-block[open]>summary:before{transform:rotate(90deg);}
    .scope-series{counter-reset:scopefig;}
    .scope-series .scope-fig{counter-increment:scopefig;}
    .scope-series .scope-fig figcaption:before{content:'Fig. ' counter(scopefig) ' – '; font-weight:600;}
  /* force 2x2 layout specifically when requested */
  .scope-grid.two-col{grid-template-columns:repeat(2,1fr);}
  @media (max-width:780px){.scope-grid.two-col{grid-template-columns:1fr;}}
  /* optional smaller variant for single large images */
  .scope-fig.scope-small img{max-width:65%; margin:0 auto;}
  @media (max-width:880px){.scope-fig.scope-small img{max-width:80%;}}
    /* custom sizing adjustments for Block 4 request */
    .scope-fig.scope-video video{width:230px; max-width:60%; display:block; margin:0 auto;}
    .scope-fig.scope-large img{max-width:92%; margin:0 auto;}
    @media (min-width:900px){
      .scope-fig.scope-large{grid-column:span 2;}
      .scope-fig.scope-large img{max-width:70%;}
    }
    @media (prefers-reduced-motion:no-preference){
      .scope-block[open] .scope-fig{animation:fadeIn .4s ease both;}
      @keyframes fadeIn{0%{opacity:0; transform:translateY(6px);}100%{opacity:1; transform:translateY(0);}}
    }
    @media (min-width:1000px){
      .scope-pair{grid-template-columns:1fr 1fr;}
    }
  </style>

  <div style="clear: both;"></div>
  <h2 id="system-objectives">System Objectives</h2>
      <figure class="block-diagram" style="margin:0 0 1.25rem;">
        <svg role="img" aria-label="High-level audio chain: Blocks 1→2→3 split into Blocks 5 (power) and 4 (LED meter) with voltage ranges" viewBox="0 0 1100 260" width="100%" preserveAspectRatio="xMidYMid meet" style="max-width:1200px; display:block; margin:auto;">
          <defs>
            <marker id="bdArrow2" markerWidth="12" markerHeight="8" refX="10" refY="4" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,8 L10,4 Z" fill="currentColor" />
            </marker>
            <style>
              .blk{fill:rgba(255,255,255,0.05);stroke:rgba(255,255,255,0.85);stroke-width:1.7;}
              .lbl{font:600 16px/1.2 system-ui, sans-serif; fill:rgba(255,255,255,0.95);}
              .range{font:13px/1.2 system-ui, sans-serif; fill:rgba(255,255,255,0.78);}
              .meta{font:12px/1.2 system-ui, sans-serif; fill:rgba(255,255,255,0.6);}
            </style>
          </defs>
          <g transform="translate(40,40)">
            <!-- Inputs label -->
            <text class="range" x="0" y="55">0.025 – 1 Vpp (L/R)</text>
            <!-- Input arrows to Block 1 (merged visually) -->
            <line x1="105" y1="40" x2="150" y2="40" stroke="currentColor" stroke-width="2" marker-end="url(#bdArrow2)" />
            <line x1="105" y1="70" x2="150" y2="70" stroke="currentColor" stroke-width="2" marker-end="url(#bdArrow2)" />

            <!-- Block 1 -->
            <rect class="blk" x="150" y="30" width="140" height="50" rx="10" />
            <text class="lbl" x="220" y="57" text-anchor="middle">Block 1</text>
            <text class="meta" x="220" y="22" text-anchor="middle">Stereo → Mono</text>
            <!-- Range after Block 1 -->
            <text class="range" x="320" y="115" text-anchor="middle">0.01 – 0.4 Vpp</text>
            <line x1="290" y1="55" x2="370" y2="55" stroke="currentColor" stroke-width="2" marker-end="url(#bdArrow2)" />

            <!-- Block 2 -->
            <rect class="blk" x="370" y="30" width="140" height="50" rx="10" />
            <text class="lbl" x="440" y="57" text-anchor="middle">Block 2</text>
            <text class="meta" x="440" y="22" text-anchor="middle">Tone</text>
            <text class="range" x="540" y="115" text-anchor="middle">0.3 – 1.2 Vpp</text>
            <line x1="510" y1="55" x2="590" y2="55" stroke="currentColor" stroke-width="2" marker-end="url(#bdArrow2)" />

            <!-- Block 3 -->
            <rect class="blk" x="590" y="30" width="140" height="50" rx="10" />
            <text class="lbl" x="660" y="57" text-anchor="middle">Block 3</text>
            <text class="meta" x="660" y="22" text-anchor="middle">Volume</text>
            <text class="range" x="750" y="115" text-anchor="middle">0 – 1.2 Vpp</text>
            <line x1="730" y1="55" x2="810" y2="55" stroke="currentColor" stroke-width="2" />

            <!-- Split node -->
            <circle cx="810" cy="55" r="4" fill="currentColor" />
            <!-- Branch down -->
            <line x1="810" y1="55" x2="810" y2="140" stroke="currentColor" stroke-width="2" />

            <!-- Block 5 (upper) -->
            <line x1="810" y1="55" x2="890" y2="55" stroke="currentColor" stroke-width="2" marker-end="url(#bdArrow2)" />
            <rect class="blk" x="890" y="30" width="140" height="50" rx="10" />
            <text class="lbl" x="960" y="57" text-anchor="middle">Block 5</text>
            <text class="meta" x="960" y="22" text-anchor="middle">Power Amp</text>

            <!-- Block 4 (lower) -->
            <line x1="810" y1="140" x2="890" y2="140" stroke="currentColor" stroke-width="2" marker-end="url(#bdArrow2)" />
            <rect class="blk" x="890" y="115" width="140" height="50" rx="10" />
            <text class="lbl" x="960" y="142" text-anchor="middle">Block 4</text>
            <text class="meta" x="960" y="107" text-anchor="middle">LED VU</text>
          </g>
        </svg>
        <figcaption style="text-align:center; font-size:.75rem; margin-top:.6rem; letter-spacing:.3px; color:rgba(255,255,255,0.7);">High‑level signal flow with post‑stage approximate amplitude envelopes.</figcaption>
      </figure>
      <div class="overflow-x-auto" style="margin:.75rem 0 1rem;">
        <table style="font-size:.8rem; min-width:680px;">
          <thead><tr><th style="text-align:left;">Block</th><th>Function</th><th>Key Range / Thresholds</th><th>Core Parts</th></tr></thead>
          <tbody>
            <tr><td>1 Mixer</td><td>Stereo → mono summing, per‑channel trim</td><td>In: 0.025–1.0 Vpp ea.  Out: ~0.01–0.04 Vpp nominal</td><td>Op‑amp, 2× 20 kΩ pots</td></tr>
            <tr><td>2 Tone</td><td>Adjustable bass / treble tilt</td><td>Gain LF 1/3×→3× (HF inversely 3×→1/3×), 20 Hz–20 kHz</td><td>RC network + pot</td></tr>
            <tr><td>3 Volume</td><td>Post‑EQ amplitude control</td><td>0 → ~1.2 Vpp</td><td>20 kΩ pot divider</td></tr>
            <tr><td>4 LED VU</td><td>Amplitude visualization</td><td>Comparators at 20 / 60 / 80 / 120 mV</td><td>4 refs + LEDs</td></tr>
            <tr><td>5 Power Amp</td><td>Current drive to speaker</td><td>Fixed gain, drives low‑Z load</td><td>TIP31 / TIP32 pair</td></tr>
          </tbody>
        </table>
      </div>
      <ol style="display:grid; gap:.9rem; padding-left:1.25rem;">
        <li><strong>Block 1 – Summing Mixer.</strong> Two AC‑coupled stereo channels feed an inverting summing node. Independent 20 kΩ potentiometers set per‑channel contribution without clipping the combined headroom (target mono output ~0.01–0.04 Vpp for nominal sources).</li>
        <li><strong>Block 2 – Tone Filter.</strong> A single potentiometer sweeps a tilt‑style RC network: low frequencies can be boosted up to 3× while highs attenuate to 1/3× (or vice‑versa), covering the 20 Hz–20 kHz band with smooth spectral shaping.</li>
        <li><strong>Block 3 – Volume Control.</strong> A 20 kΩ divider implements user gain from mute (≈0 Vpp) to ≈1.2 Vpp while presenting a low source impedance to downstream comparator and driver stages.</li>
        <li><strong>Block 4 – LED Level Indicator.</strong> Four comparators reference a 9 V ladder (≈20, 60, 80, 120 mV). Progressive LED illumination forms a simple pseudo‑VU display without loading the audio path.</li>
        <li><strong>Block 5 – Power Amplifier.</strong> Complementary emitter follower (TIP31/TIP32) supplies current gain; the op‑amp front end biases the pair to limit crossover distortion and cleanly drive the speaker at listening levels.</li>
      </ol>
      
      <h2 id="theory-experimental-methods">Theory &amp; Experimental Methods</h2>
      <figure>
        <img src="/academics/audio-amplifier-circuit/complete-schem.png" alt="Complete schematic: summing mixer, tone filter, volume divider, LED comparator ladder, complementary emitter follower power stage" style="width:100%; max-width:1100px; margin-inline:auto; border-radius:12px; box-shadow:0 4px 28px -6px rgba(0,0,0,0.5);" />
        <figcaption style="text-align:center; font-size:.8rem; opacity:.8;">Complete schematic – unified view of the five functional blocks (source: complete schem.png).</figcaption>
      </figure>
      <h3>Theoretical Overview</h3>
      <ul>
        <li><strong>Block 1 (Summing Mixer):</strong> Implements an inverting summer. For equal input resistors R<sub>in</sub> and feedback resistor R<sub>f</sub>, each channel contribution ≈ −(R<sub>f</sub>/R<sub>in</sub>)·V<sub>CH</sub>. Potentiometers precede the summing node providing variable effective R<sub>in</sub> (amplitude trim) to keep summed V<sub>out</sub> within the 0.01–0.04 V<sub>pp</sub> design envelope.</li>
        <li><strong>Block 2 (Tone Filter):</strong> A single‑pot “tilt” network whose impedance division versus frequency alters relative LF/HF gains. At one extreme G<sub>LF</sub> ≈ 3×, G<sub>HF</sub> ≈ 1/3×; reversed at the other. Capacitor reactances chosen so pivot occurs inside the audio band (order of a few kHz) while still spanning 20 Hz–20 kHz.</li>
        <li><strong>Block 3 (Volume Divider):</strong> Passive 20 kΩ potentiometer forming a variable attenuator with low output impedance ( ≪ comparator input impedance ), preserving tone shaping while setting 0–1.2 V<sub>pp</sub> user level.</li>
        <li><strong>Block 4 (LED VU Ladder):</strong> Resistor ladder establishes monotonic DC thresholds (≈20/60/80/120 mV). Each comparator outputs a logic‑level drive through its series LED resistor (~810 Ω) giving stepped amplitude indication. Instantaneous (no envelope) response intentionally chosen for simplicity.</li>
        <li><strong>Block 5 (Power Stage):</strong> Complementary emitter follower provides current gain (β aggregation) without additional voltage gain; op‑amp supplies drive and bias to minimize crossover distortion while keeping the driver within linear output swing for the target speaker load.</li>
      </ul>

      <figure class="overview-photo">
        <figcaption>Full breadboard build — neat wiring and short returns help keep noise low.</figcaption>
      </figure>

      <h2 id="design-process">Design Process</h2>
      <figure class="amp-breadboard">
        <img class="amp-breadboard-img" src="/academics/audio-amplifier-circuit/breadboard-overview.png" alt="Breadboard overview of the full audio chain" />
        <figcaption style="text-align:center; font-size:.75rem; opacity:.75; margin-top:.55rem;">Complete schematic used as reference during block‑by‑block bring‑up.</figcaption>
      </figure>

      <h3 id="blocks-overview">Blocks 1–5 Implementation</h3>
      <p style="margin-top:.4rem; font-size:.85rem; opacity:.85;">Compact gallery of the five functional stages. Click any card for details.</p>
      <div class="amp-block-grid">
        <div class="amp-block-card" id="block-1">
          <figure class="amp-fig">
            <div class="amp-block-label">Block 1 – Summing Mixer</div>
            <img class="amp-block-img amp-invert" src="/academics/audio-amplifier-circuit/block1.png" alt="Summing amplifier stage on breadboard" />
            <figcaption>Summing mixer schematic / breadboard stage.</figcaption>
          </figure>
          <details>
            <summary>Details</summary>
            <p>A classic inverting summing amplifier mixes left/right into mono. Input potentiometers trim each channel to preserve headroom and minimize noise at the summing node.</p>
          </details>
        </div>
        <div class="amp-block-card" id="block-2">
          <figure class="amp-fig">
            <div class="amp-block-label">Block 2 – Tone Control</div>
            <img class="amp-block-img amp-invert" src="/academics/audio-amplifier-circuit/block2.png" alt="Tone control RC network with potentiometer" />
            <figcaption>Tilt EQ network schematic.</figcaption>
          </figure>
          <details>
            <summary>Details</summary>
            <p>Potentiometer‑controlled RC tilt network shapes the spectrum (≈20 Hz–20 kHz) providing complementary bass boost vs. treble cut (and vice‑versa) without clipping.</p>
          </details>
        </div>
        <div class="amp-block-card" id="block-3">
          <figure class="amp-fig">
            <div class="amp-block-label">Block 3 – Volume</div>
            <img class="amp-block-img amp-invert" src="/academics/audio-amplifier-circuit/block3.png" alt="Volume control potentiometer wiring" />
            <figcaption>Output level control potentiometer.</figcaption>
          </figure>
          <details>
            <summary>Details</summary>
            <p>20 kΩ potentiometer as a divider provides smooth attenuation from mute to ≈1.2 Vpp while presenting low source impedance to comparators and driver.</p>
          </details>
        </div>
        <div class="amp-block-card" id="block-4">
          <figure class="amp-fig">
            <div class="amp-block-label">Block 4 – LED Indicator</div>
            <img class="amp-block-img amp-invert" src="/academics/audio-amplifier-circuit/block4.png" alt="Comparator-based LED volume indicator" />
            <figcaption>Comparator ladder + LEDs.</figcaption>
          </figure>
          <details>
            <summary>Details</summary>
            <p>Four comparators reference a resistor ladder (~20/60/80/120 mV) lighting LEDs progressively for instantaneous amplitude visualization.</p>
          </details>
        </div>
        <div class="amp-block-card" id="block-5">
          <figure class="amp-fig">
            <div class="amp-block-label">Block 5 – Power Amp</div>
            <img class="amp-block-img amp-invert" src="/academics/audio-amplifier-circuit/block5.png" alt="Power amplifier stage with TIP31/TIP32" />
            <figcaption>Complementary emitter follower stage.</figcaption>
          </figure>
          <details>
            <summary>Details</summary>
            <p>Complementary TIP31/TIP32 emitter follower furnishes current gain; op‑amp front‑end biases the pair to limit crossover distortion and cleanly drive the load.</p>
          </details>
        </div>
      </div>

      <h2 id="results">Results</h2>
      <ul>
        <li>Stereo signals were mixed into a stable mono channel.</li>
        <li>Tone control produced clear bass and treble adjustments.</li>
        <li>The volume control stage provided smooth, reliable output scaling.</li>
        <li>The LED indicator responded dynamically to signal amplitude, creating a real-time visual representation of the music.</li>
        <li>The amplifier stage drove the speaker effectively at normal listening levels.</li>
      </ul>
      <h3 id="oscilloscope-measurements">Oscilloscope Results</h3>
      <p style="font-size:.85rem; opacity:.85;">Each block was verified by capturing input (reference) and output waveforms. Use consistent vertical scaling so amplitude changes and threshold activations are visually comparable. Replace the <code>src</code> attributes below with your final PNGs/JPGs (recommended width 1000–1400 px for clarity). Keep captions concise and emphasize what changed between traces (gain, attenuation, threshold crossings).</p>
      <!-- Collapsible structured measurement sets -->
      <details class="scope-block" open id="scope-block1">
        <summary>Block 1 – Summing Mixer (Independent Channel Trim)</summary>
        <div class="scope-grid scope-series two-col">
          <figure class="scope-fig">
            <img src="/academics/audio-amplifier-circuit/block1-left-max.png" alt="Left channel input (top) vs mixed output (bottom) at maximum trim" loading="lazy" />
            <figcaption>Left channel max trim: output ≈2.0 Vpp (matches input) → full gain path engaged.</figcaption>
          </figure>
          <figure class="scope-fig">
            <img src="/academics/audio-amplifier-circuit/block1-left-min.png" alt="Left channel input (top) vs mixed output (bottom) at minimum trim" loading="lazy" />
            <figcaption>Left channel min trim: output ~80 mVpp residual while input unchanged — confirms attenuation range & isolation.</figcaption>
          </figure>
          <figure class="scope-fig">
            <img src="/academics/audio-amplifier-circuit/block1-right-max.png" alt="Right channel input (top) vs mixed output (bottom) at maximum trim" loading="lazy" />
            <figcaption>Right channel max trim: symmetric ≈2.05 Vpp contribution shows balanced summing network.</figcaption>
          </figure>
          <figure class="scope-fig">
            <img src="/academics/audio-amplifier-circuit/block1-right-min.png" alt="Right channel input (top) vs mixed output (bottom) at minimum trim" loading="lazy" />
            <figcaption>Right channel min trim: output suppressed to noise floor (~80 mVpp) with negligible bleed.</figcaption>
          </figure>
        </div>
      </details>
      <details class="scope-block" open id="scope-block2">
        <summary>Block 2 – Tone Control (Tilt Extremes at 20 kHz)</summary>
        <div class="scope-grid scope-series">
          <figure class="scope-fig">
            <img src="/academics/audio-amplifier-circuit/block2-max.png" alt="20 kHz input vs boosted output – potentiometer clockwise" loading="lazy" />
            <figcaption>Clockwise (boost): output ≈8.4 Vpp vs ≈4.1 Vpp input — high‑frequency emphasis.</figcaption>
          </figure>
          <figure class="scope-fig">
            <img src="/academics/audio-amplifier-circuit/block2-min.png" alt="20 kHz input vs attenuated output – potentiometer counter‑clockwise" loading="lazy" />
            <figcaption>Counter‑clockwise (cut): output reduced to ≈1.2 Vpp — full attenuation range demonstrated.</figcaption>
          </figure>
        </div>
      </details>
      <details class="scope-block" open id="scope-block3">
        <summary>Block 3 – Volume Stage (Max vs Near‑Mute)</summary>
        <div class="scope-grid scope-series">
          <figure class="scope-fig">
            <img src="/academics/audio-amplifier-circuit/block3-max.png" alt="1.2 Vpp input vs full-scale output" loading="lazy" />
            <figcaption>Pot at max: output ≈1.29 Vpp (≈unity gain) — minimal insertion loss.</figcaption>
          </figure>
          <figure class="scope-fig">
            <img src="/academics/audio-amplifier-circuit/block3-min.png" alt="1.2 Vpp input vs muted output" loading="lazy" />
            <figcaption>Pot near min: output ~80 mVpp residual noise — effective mute without loading source.</figcaption>
          </figure>
        </div>
      </details>
      <details class="scope-block" open id="scope-block4">
        <summary>Block 4 – LED Indicator (Comparator Threshold Region)</summary>
        <div class="scope-grid scope-series">
          <figure class="scope-fig scope-small scope-video">
            <video controls playsinline muted loop autoplay preload="metadata" style="border-radius:10px; background:#000; box-shadow:0 4px 22px -8px rgba(0,0,0,.6);">
              <source src="/academics/audio-amplifier-circuit/volumecontrol.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <figcaption>Real-time LED ladder response while sweeping volume control — successive thresholds light as amplitude crosses ≈20/60/80/120 mV.</figcaption>
          </figure>
          <figure class="scope-fig scope-large">
            <img src="/academics/audio-amplifier-circuit/block4-graph.png" alt="Input and comparator node near LED thresholds" loading="lazy" />
            <figcaption>Comparator node traverses ≈20/60/80/120 mV thresholds — drives stepped LED illumination (not visible on scope but correlated).</figcaption>
          </figure>
        </div>
      </details>
      <details class="scope-block" open id="scope-block5">
        <summary>Block 5 – Power Stage (Drive Integrity)</summary>
        <div class="scope-grid scope-series">
          <figure class="scope-fig scope-small">
            <img src="/academics/audio-amplifier-circuit/block5-graph.png" alt="Power amplifier input vs output across load" loading="lazy" />
            <figcaption>Output mirrors input symmetrically; absence of crossover notch indicates proper bias of complementary emitter follower.</figcaption>
          </figure>
        </div>
      </details>


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
