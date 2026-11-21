import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const query = `
query {
  viewer {
    login
    name
    contributionsCollection {
      totalCommitContributions
      restrictedContributionsCount
      totalPullRequestContributions
      totalIssueContributions
      totalRepositoryContributions
      contributionCalendar {
        totalContributions
      }
    }
    repositories(first: 100, ownerAffiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER], isFork: false) {
      totalCount
      nodes {
        stargazerCount
        languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
          edges {
            size
            node {
              name
              color
            }
          }
        }
      }
    }
  }
}
`;

const out = execFileSync('gh', ['api', 'graphql', '-f', `query=${query}`], { encoding: 'utf8' });
const viewer = JSON.parse(out).data.viewer;
const cc = viewer.contributionsCollection;

const publicCommits = cc.totalCommitContributions;
const privateCommits = cc.restrictedContributionsCount;
const totalCommits = publicCommits + privateCommits;
const totalContribs = cc.contributionCalendar.totalContributions;
const prsAndIssues = cc.totalPullRequestContributions + cc.totalIssueContributions;
const totalRepos = viewer.repositories.totalCount;

// Snapshot / High-Water Mark Protection:
const statsPath = 'assets/github-stats.svg';
if (fs.existsSync(statsPath)) {
  const existing = fs.readFileSync(statsPath, 'utf8');
  const m = existing.match(/Total Commits \(Last Year\):<\/text>\s*<text[^>]*>([\d,]+)<\/text>/);
  if (m) {
    const prevCommits = parseInt(m[1].replace(/,/g, ''), 10);
    if (prevCommits > 500 && totalCommits < prevCommits * 0.6) {
      console.log(
        `[SNAPSHOT PROTECTION] Total commits dropped from ${prevCommits} to ${totalCommits}. Preserving existing stats & language cards!`
      );
      process.exit(0);
    }
  }
}

const statsSvg = `<svg width="467" height="195" viewBox="0 0 467 195" fill="none" xmlns="http://www.w3.org/2000/svg" role="img">
  <title>Enes Karamanoğlu's GitHub Stats, Rank: A+</title>
  <style>
    .header { font: 600 17px 'Segoe UI', Ubuntu, Sans-Serif; fill: #00FF9C; }
    .stat { font: 600 13.5px 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif; fill: #C9D1D9; }
    .bold { font-weight: 700; fill: #FFFFFF; }
    .sub { font: 500 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: #8B949E; }
    .rank-text { font: 800 22px 'Segoe UI', Ubuntu, Sans-Serif; fill: #00FF9C; }
    .rank-sub { font: 600 10px 'Segoe UI', Ubuntu, Sans-Serif; fill: #8B949E; }
    .icon { fill: #00FF9C; }
    @keyframes rankProgress {
      from { stroke-dashoffset: 251.2; }
      to { stroke-dashoffset: 28; }
    }
    .rank-circle {
      stroke-dasharray: 251.2;
      stroke-dashoffset: 28;
      animation: rankProgress 1.4s ease-out forwards;
    }
  </style>
  <rect x="0.5" y="0.5" rx="4.5" height="99%" width="466" fill="#0D1117" stroke="none"/>
  <g transform="translate(25, 32)">
    <text x="0" y="0" class="header">Enes Karamanoğlu's GitHub Stats</text>
    <text x="0" y="16" class="sub">Includes Public &amp; Private (Organization) Contributions</text>
  </g>

  <g transform="translate(25, 68)">
    <g transform="translate(0, 0)">
      <svg class="icon" viewBox="0 0 16 16" width="16" height="16" y="-12">
        <path fill-rule="evenodd" d="M1.643 3.143L.427 1.927A.25.25 0 000 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 00.177-.427L2.715 4.215a6.5 6.5 0 11-1.18 4.458.75.75 0 10-1.493.154 8.001 8.001 0 101.6-5.684zM7.75 4a.75.75 0 01.75.75v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5A.75.75 0 017.75 4z"/>
      </svg>
      <text class="stat" x="25" y="0">Total Commits (Last Year):</text>
      <text class="stat bold" x="215" y="0">${totalCommits.toLocaleString('en-US')}</text>
    </g>

    <g transform="translate(0, 26)">
      <svg class="icon" viewBox="0 0 16 16" width="16" height="16" y="-12">
        <path fill-rule="evenodd" d="M4 4v2h-.25A1.75 1.75 0 002 7.75v5.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 13.25v-5.5A1.75 1.75 0 0012.25 6H12V4a4 4 0 10-8 0zm6.5 2V4a2.5 2.5 0 00-5 0v2h5zM12 7.5h.25a.25.25 0 01.25.25v5.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-5.5a.25.25 0 01.25-.25H12z"/>
      </svg>
      <text class="stat" x="25" y="0">Private &amp; Org Commits:</text>
      <text class="stat bold" x="215" y="0">${privateCommits.toLocaleString('en-US')}</text>
    </g>

    <g transform="translate(0, 52)">
      <svg class="icon" viewBox="0 0 16 16" width="16" height="16" y="-12">
        <path fill-rule="evenodd" d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z"/>
      </svg>
      <text class="stat" x="25" y="0">PRs &amp; Issues Resolved:</text>
      <text class="stat bold" x="215" y="0">${prsAndIssues}</text>
    </g>

    <g transform="translate(0, 78)">
      <svg class="icon" viewBox="0 0 16 16" width="16" height="16" y="-12">
        <path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>
      </svg>
      <text class="stat" x="25" y="0">Total Activity / Repos:</text>
      <text class="stat bold" x="215" y="0">${totalContribs.toLocaleString('en-US')} (${totalRepos} repos)</text>
    </g>
  </g>

  <g transform="translate(375, 108)">
    <circle cx="0" cy="0" r="40" stroke="#161B22" stroke-width="6" fill="none"/>
    <circle class="rank-circle" cx="0" cy="0" r="40" stroke="#00FF9C" stroke-width="6" stroke-linecap="round" fill="none" transform="rotate(-90)"/>
    <text x="0" y="6" text-anchor="middle" class="rank-text">A+</text>
    <text x="0" y="22" text-anchor="middle" class="rank-sub">TOP TIER</text>
  </g>
</svg>`;

const skip = new Set(['XSLT', 'Pascal', 'Batchfile']);
const totals = new Map();
const colors = new Map();

for (const repo of viewer.repositories.nodes) {
  for (const edge of repo.languages.edges) {
    const name = edge.node.name;
    if (skip.has(name)) continue;
    totals.set(name, (totals.get(name) || 0) + edge.size);
    colors.set(name, edge.node.color || '#00FF9C');
  }
}

const sortedLangs = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
const totalSize = sortedLangs.reduce((acc, [, v]) => acc + v, 0) || 1;

const barWidth = 250;
let xOffset = 0;
const barRects = [];
const legendItems = [];

sortedLangs.forEach(([name, size], idx) => {
  const pct = (size / totalSize) * 100;
  const w = Math.max(5.5, (size / totalSize) * barWidth);
  const color = colors.get(name) || '#00FF9C';
  barRects.push(`<rect x="${xOffset.toFixed(1)}" y="0" width="${w.toFixed(1)}" height="8" fill="${color}"/>`);
  xOffset += w;

  const col = idx % 2;
  const row = Math.floor(idx / 2);
  const lx = col === 0 ? 0 : 132;
  const ly = row * 25;
  const pctStr = `${Math.max(pct, 1.0).toFixed(1)}%`;
  legendItems.push(`
      <g transform="translate(${lx}, ${ly})">
        <circle cx="5" cy="-4" r="5" fill="${color}"/>
        <text x="15" y="0" class="lang-name">${name} <tspan class="lang-pct">${pctStr}</tspan></text>
      </g>`);
});

const langsSvg = `<svg width="300" height="195" viewBox="0 0 300 195" fill="none" xmlns="http://www.w3.org/2000/svg" role="img">
  <title>Most Used Languages (Public &amp; Private)</title>
  <style>
    .header { font: 600 16px 'Segoe UI', Ubuntu, Sans-Serif; fill: #00FF9C; }
    .sub { font: 500 10.5px 'Segoe UI', Ubuntu, Sans-Serif; fill: #8B949E; }
    .lang-name { font: 600 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: #C9D1D9; }
    .lang-pct { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: #8B949E; }
  </style>
  <rect x="0.5" y="0.5" rx="4.5" height="99%" width="299" fill="#0D1117" stroke="none"/>
  <g transform="translate(25, 32)">
    <text x="0" y="0" class="header">Most Used Languages</text>
    <text x="0" y="16" class="sub">Across Public &amp; Private Repositories</text>
  </g>

  <g transform="translate(25, 65)">
    <clipPath id="barClip">
      <rect x="0" y="0" width="250" height="8" rx="4"/>
    </clipPath>
    <g clip-path="url(#barClip)">
      ${barRects.join('\n      ')}
    </g>
  </g>

  <g transform="translate(25, 102)">
    ${legendItems.join('')}
  </g>
</svg>`;

fs.mkdirSync('assets', { recursive: true });
fs.writeFileSync('assets/github-stats.svg', statsSvg, 'utf8');
fs.writeFileSync('assets/top-langs.svg', langsSvg, 'utf8');
console.log(`Generated assets/github-stats.svg (${totalCommits} commits) and assets/top-langs.svg!`);
