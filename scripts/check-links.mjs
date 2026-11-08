import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const files = fs.readdirSync(rootDir);
const allFilesNfc = new Set(files.map(f => f.normalize('NFC')));
const mdFiles = files.filter(f => f.endsWith('.md')).sort();

let hasError = false;
const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

console.log(`🔍 마크다운 내부 링크 검사 시작 (총 ${mdFiles.length}개 파일)...`);

for (const md of mdFiles) {
  const content = fs.readFileSync(path.join(rootDir, md), 'utf-8');
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const [_, text, rawLink] = match;
    if (
      rawLink.startsWith('http://') ||
      rawLink.startsWith('https://') ||
      rawLink.startsWith('#') ||
      rawLink.startsWith('mailto:')
    ) {
      continue;
    }

    const cleanLink = rawLink.split('#')[0].split('?')[0];
    if (!cleanLink) continue;

    const decoded = decodeURIComponent(cleanLink);
    const targetNfc = decoded.normalize('NFC');

    if (!allFilesNfc.has(targetNfc)) {
      console.error(`❌ [${md}] 깨진 링크 발견: "${rawLink}" -> 대상 파일 "${targetNfc}"이 존재하지 않습니다.`);
      hasError = true;
    }
  }
}

if (hasError) {
  console.error('\n⚠️ 링크 검사 실패: 깨진 내부 링크가 존재합니다.');
  process.exit(1);
} else {
  console.log('✅ 모든 마크다운 내부 링크가 유효합니다.');
}
