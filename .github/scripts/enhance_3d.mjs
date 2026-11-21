import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const svgPath = 'profile-3d-contrib/profile-night-green.svg';

function extractContributions(svgContent) {
  const m = svgContent.match(/>(\d+)<\/text><text[^>]*>contributions<\/text>/);
  return m ? parseInt(m[1], 10) : 0;
}

if (fs.existsSync(svgPath)) {
  const newContent = fs.readFileSync(svgPath, 'utf8');
  const newCount = extractContributions(newContent);

  let prevCount = 0;
  try {
    const prevContent = execFileSync('git', ['show', `HEAD:${svgPath}`], { encoding: 'utf8' });
    prevCount = extractContributions(prevContent);
  } catch {
    // No previous commit or file in HEAD
  }

  // High-Water Mark / Organization Removal Protection:
  // If contributions drop by more than 40% (e.g. leaving an org hides private commits),
  // preserve the existing high-contribution 3D graphs instead of overwriting them.
  if (prevCount > 500 && newCount < prevCount * 0.6) {
    console.log(
      `[SNAPSHOT PROTECTION] Contributions dropped from ${prevCount} to ${newCount}. Preserving existing 3D graphs!`
    );
    execFileSync('git', ['checkout', 'HEAD', '--', 'profile-3d-contrib']);
    process.exit(0);
  }

  let s = newContent;
  // 1. Clean up any escaped backslash quotes
  s = s.replace(/\\"/g, '"');
  // 2. Seamless GitHub Dark background (#0D1117)
  s = s.replace(/fill:\s*#00000f;/g, 'fill: #0D1117;').replace(/stroke:\s*#00000f;/g, 'stroke: #0D1117;');
  // 3. Convert 1-time 3s rise animation into continuous 8s rise-hold-reset animation
  s = s.replace(
    /values="([^;"]+)\s*;\s*([^;"]+)"\s+dur="3s"\s+repeatCount="1"/g,
    'values="$1;$2;$2;$1" keyTimes="0;0.25;0.85;1" dur="8s" repeatCount="indefinite"'
  );

  if (s.includes('\\"')) {
    throw new Error('Found escaped quotes in SVG!');
  }

  fs.writeFileSync(svgPath, s, 'utf8');
  console.log(`Successfully enhanced profile-night-green.svg (${newCount} contributions, snapshot protection active)`);
}
