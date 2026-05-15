import styles from './FlowOfPlay.module.css';

const NodeLabel = ({ id }: { id: string }) => (
  <span className={styles.nodeLabel}>{id}</span>
);

const GoTo = ({ node, label }: { node: string; label?: string }) => (
  <a href={`#node-${node}`} className={styles.goTo}>{label ?? `go to ${node}`}</a>
);

export const FlowOfPlay = () => (
  <div className={styles.flow}>
    <p className={styles.intro}>Over multiple sessions, a game of <em>Stonetop</em> generally follows this pattern. Each node is labeled — follow the connections to see where play goes next.</p>

    <div className={styles.nodes}>

      <div className={styles.node} id="node-A">
        <NodeLabel id="A" />
        <div className={styles.nodeTitle}>First Adventure</div>
        <div className={styles.nodeSubtitle}>(Book I, page 251)</div>
        <ul className={styles.nodeList}>
          <li>Setup questions</li>
          <li>Set the scene (at home)</li>
          <li>Drop your hook</li>
          <li>See how folks react</li>
        </ul>
        <div className={styles.nodeExits}>
          <span className={styles.exit}>PCs take the hook → <GoTo node="B" /></span>
          <span className={styles.exitDashed}>PCs ignore the hook → <GoTo node="E" /></span>
        </div>
      </div>

      <div className={styles.node} id="node-B">
        <NodeLabel id="B" />
        <div className={styles.nodeTitle}>Expedition</div>
        <div className={styles.nodeSubtitle}>(Book I, page 301)</div>
        <ul className={styles.nodeList}>
          <li>Preparations</li>
          <li>Legs of travel/points of interest</li>
          <li>Challenges, surprises, resolution</li>
        </ul>
        <div className={styles.nodeExits}>
          <span className={styles.exit}><GoTo node="C" /></span>
        </div>
      </div>

      <div className={styles.node} id="node-C">
        <NodeLabel id="C" />
        <div className={styles.nodeTitle}>Aftermath</div>
        <div className={styles.nodeSubtitle}>(Book I, page 490)</div>
        <ul className={styles.nodeList}>
          <li>Determine what&rsquo;s happened</li>
          <li>Play out the return/post-crisis</li>
          <li>See what follows</li>
          <li>Transition to downtime</li>
        </ul>
        <div className={styles.nodeExits}>
          <span className={styles.exit}><GoTo node="E" /></span>
        </div>
      </div>

      <div className={styles.node} id="node-D">
        <NodeLabel id="D" />
        <div className={styles.nodeTitle}>Crisis</div>
        <div className={styles.nodeSubtitle}>(Book I, page 499)</div>
        <ul className={styles.nodeList}>
          <li>Trouble erupts at home</li>
          <li>Play it out, see what happens</li>
          <li>Quite possibly Meet With Disaster</li>
        </ul>
        <div className={styles.nodeExits}>
          <span className={styles.exit}>PCs stay home → <GoTo node="C" /></span>
          <span className={styles.exit}>PCs head out in response → <GoTo node="B" /></span>
        </div>
      </div>

      <div className={styles.node} id="node-E">
        <NodeLabel id="E" />
        <div className={styles.nodeTitle}>Downtime</div>
        <div className={styles.nodeSubtitle}>(Book I, page 496)</div>
        <ul className={styles.nodeList}>
          <li>Zoom out, deal with logistics</li>
          <li>Establish goals and intentions</li>
          <li>Play out situations as needed</li>
          <li>Show the passing of time</li>
        </ul>
        <div className={styles.nodeExits}>
          <span className={styles.exit}>As a hard GM move → <GoTo node="D" /></span>
          <span className={styles.exit}>Opportunity, threat(s), or requirement → <GoTo node="B" /></span>
          <span className={styles.exit}>Eventually → <GoTo node="F" /></span>
        </div>
      </div>

      <div className={styles.node} id="node-F">
        <NodeLabel id="F" />
        <div className={styles.nodeTitle}>Seasons Change</div>
        <div className={styles.nodeSubtitle}>(Book I, page 516)</div>
        <ul className={styles.nodeList}>
          <li>Zoom out, deal with logistics</li>
          <li>Establish goals and intentions</li>
          <li>Play out situations as needed</li>
          <li>Show the passing of time</li>
        </ul>
        <div className={styles.nodeExits}>
          <span className={styles.exit}>Threat(s) → <GoTo node="D" /></span>
          <span className={styles.exit}>Opportunity or threat(s) → <GoTo node="B" /></span>
          <span className={styles.exit}>Quiet (for now) → <GoTo node="E" /></span>
        </div>
      </div>

    </div>
  </div>
);
