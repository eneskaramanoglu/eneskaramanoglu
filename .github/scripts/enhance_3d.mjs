import fs from 'node:fs';

const svgPath = 'profile-3d-contrib/profile-night-green.svg';
if (fs.existsSync(svgPath)) {
  let s = fs.readFileSync(svgPath, 'utf8');
  // 1. Clean up any escaped backslash quotes from previous run
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
  console.log('Successfully enhanced profile-night-green.svg (0 escaped quotes)');
}
