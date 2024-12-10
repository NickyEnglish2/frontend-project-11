install:
		npm ci

weblaunch:
		npx webpack serve

lint:
		npx eslint .

packremove:
		rm -rf dist

newpack:
		NODE_ENV=production npx webpack