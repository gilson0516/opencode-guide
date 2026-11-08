import { execSync } from 'node:child_process';

console.log('🔍 Git 인덱스 파일명 유니코드(NFC) 검사 시작...');

let filesOutput = '';
try {
  filesOutput = execSync('git -c core.quotepath=false ls-files', { encoding: 'utf-8' });
} catch (err) {
  console.error('❌ git ls-files 실행 실패:', err.message);
  process.exit(1);
}

const files = filesOutput.split('\n').filter(Boolean);
let hasError = false;

for (const file of files) {
  const nfc = file.normalize('NFC');
  const nfd = file.normalize('NFD');
  if (file === nfd && file !== nfc) {
    console.error(`❌ NFD(자소분리) 파일명이 Git 인덱스에서 발견됨: "${file}"`);
    hasError = true;
  }
}

if (hasError) {
  console.error('\n⚠️ 유니코드 검사 실패: Git 인덱스에 자소 분리(NFD) 파일명이 포함되어 있습니다.');
  console.error('💡 해결 방법: git config core.precomposeunicode true 설정 후 파일을 재스테이징하세요.');
  process.exit(1);
} else {
  console.log(`✅ 검사 완료 (총 ${files.length}개 파일): 모든 Git 파일명이 표준 완성형(NFC)입니다.`);
}
