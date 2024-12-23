# ACCOUNTS

- username: kevin, password: kevin --> user account
- username: admin, password: admin --> admin account

Go to posts, and look for the "for the TA" tag there.

# CONTRIBUTIONS

## Kevin: contributed under dungwoong, wangke61, linux

- nav bar
- auth system and auto-refresh
- Global context provider, with wrapper functions for calling the API
- auto-redirect to /login for certain pages eg. /profile, /editprofile
- light/dark theme
- /login, /signup, /profile, /editprofile
- "/" page for non-authenticated users
- /newpost
- /posts
- startup.sh and docker setup
- create the sample DB
- added <ParagraphWithTemplateLinks> for /posts/[id]

Bugfixes/QA:

- new comments/get api endpoint wasn't returning all info, I fixed that
- templates was doing filter by user in the frontend, resulting in pages with <9 items. I changed it to filter in the backend
- posts weren't showing newlines. I added whitespace-prewrap
- UI: new template click title to edit
- backend issue: template save would overwrite explanation with language
- point out bugs in /posts/[id]: upvote/downvote not showing, upvotes show undefined if you upvote the post.
- posts, don't show upvote/downvote etc. buttons for non-logged in users, or hidden posts

# Emily: Contributed under 3m1ly03

- /newtemplate
- /templates
- /templates/[id]
- adding code syntax highlighting
- CodeEditor component

# Benson: Contributed under Benson-chou

- /posts/[id]
- /posts: pagination disallow next page click, hidden posts show as red, and display to authors/admin only
- CommentSortForm component

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
