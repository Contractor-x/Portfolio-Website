const { useState, useEffect } = React;

// Profile data
const profile = {
  name: "John Doe",
  githubUsername: "octocat", // demo GitHub username
  profileLink: "https://github.com/octocat",
  profilePicture:
    "https://placehold.co/160x160/5b8362/a8d5ba?text=Profile+Picture",
};

function useGitHubCommitCount(username) {
  const [commitCount, setCommitCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) {
      setLoading(false);
      setCommitCount(null);
      return;
    }
    setLoading(true);
    setError(null);

    async function fetchCommits() {
      try {
        const now = new Date();
        const lastYear = new Date();
        lastYear.setFullYear(now.getFullYear() - 1);
        let pushesInLastYear = 0;
        let page = 1;
        let done = false;
        while (!done && page <= 3) {
          const res = await fetch(
            `https://api.github.com/users/${username}/events/public?page=${page}&per_page=100`
          );
          if (!res.ok) {
            throw new Error('Failed to fetch GitHub events');
          }
          const data = await res.json();
          if (!Array.isArray(data) || data.length === 0) break;

          for (let event of data) {
            if (event.type === "PushEvent") {
              const eventDate = new Date(event.created_at);
              if (eventDate >= lastYear) {
                pushesInLastYear += event.payload.commits.length;
              } else {
                done = true;
                break;
              }
            }
          }
          page++;
        }
        setCommitCount(pushesInLastYear);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchCommits();
  }, [username]);
  return { commitCount, loading, error };
}

function PortfolioApp() {
  const { commitCount, loading, error } = useGitHubCommitCount(profile.githubUsername);

  // Blank container ready for achievements - no data filled so user can insert manually
  const [achievementsList, setAchievementsList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);

  // Instruction for user: fill achievementsList and projectsList arrays with your data here or dynamically later

  return (
    <>
      <h1>{profile.name}'s Portfolio</h1>

      <section aria-labelledby="achievements-title">
        <h2 id="achievements-title">Achievements</h2>
        <ul className="achievements-list" aria-live="polite" aria-atomic="true">
          {achievementsList.length === 0 ? (
            <li style={{fontStyle: 'italic', color: '#5b8362'}}>
              No achievements added yet. Insert them in the achievements container.
            </li>
          ) : (
            achievementsList.map((ach, idx) => (
              <li key={idx} className="achievement-item" tabIndex="0">{ach}</li>
            ))
          )}
        </ul>
      </section>

      <section aria-labelledby="projects-title" className="projects-container">
        <h2 id="projects-title">Projects</h2>
        <div className="projects-carousel" role="list" aria-label="Project carousel">
          {projectsList.length === 0 ? (
            <div style={{fontStyle: 'italic', color: '#5b8362'}}>
              No projects added yet. Insert your project cards in the projects container.
            </div>
          ) : projectsList.map((project, idx) => (
            <article key={idx} tabIndex="0" className="project-card" aria-label={`Project titled ${project.title}`}>
              <div className="project-image">
                <img
                  src={project.image}
                  alt={`Screenshot or visual for project ${project.title}`}
                  loading="lazy"
                  onError={e => {e.target.src = "https://placehold.co/400x240/3f6647/a8d5ba?text=No+Image"}}
                />
              </div>
              <div className="project-content">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
                <div className="project-links">
                  {project.links?.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${link.label} for project ${project.title}`}
                    >
                      <span className="material-icons md-18" aria-hidden="true">{link.icon}</span>
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-label="GitHub Commit Stats" className="github-stats" tabIndex="0">
        <h3>GitHub Contributions in Last Year</h3>
        {loading && <p>Loading commit data...</p>}
        {error && <p>Error loading data: {error}</p>}
        {commitCount !== null && !loading && !error && (
          <p>
            Total commits in the last 12 months: <strong>{commitCount}</strong>
          </p>
        )}
        <p>
          View more at:&nbsp;
          <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noopener noreferrer">
            {profile.githubUsername}'s GitHub profile
          </a>
        </p>
      </section>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<PortfolioApp />);
