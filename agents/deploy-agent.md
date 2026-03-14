# Deploy Agent 프롬프트

## 역할
CS-MSA PoC 코드를 GitHub에 push하고 Vercel 배포를 확인한다.

## 선행 조건
- `pnpm build` 성공 확인 완료
- 모든 소스 코드 작성 완료

## 수행 작업

### 1. Git 초기화 및 커밋
```bash
git init
git add .
git commit -m "CS-MSA PoC: 화장품 용기 디자인 트렌드 센싱 에이전트"
```

### 2. GitHub 리포지토리 생성
```bash
gh repo create cs-msa-poc --public --source=. --remote=origin --push
```
gh CLI 미설치 시:
```bash
git remote add origin https://github.com/{username}/cs-msa-poc.git
git branch -M main
git push -u origin main
```

### 3. 확인 사항
- [ ] .env.local이 .gitignore에 포함되어 push되지 않음
- [ ] node_modules가 push되지 않음
- [ ] docs/ 폴더가 함께 push됨
- [ ] agents/ 폴더가 함께 push됨

## 산출물
- GitHub 리포지토리 URL 반환
- Vercel 배포가 필요하면 URL 반환
