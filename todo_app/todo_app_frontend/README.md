## Todo app frontend

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

Fetches a new image from https://picsum.photos/1200 every 10 minutes. The picture is saved to persistent storage and persists between application restarts.
Displays the image and a list of todos fetched from backend.

The frontend project can be tested locally by running:

`npm install`

`npm run dev`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Uses the following environment values:
IMAGEPATH: the path where the image is saved
NEXT_PUBLIC_BACKEND_SERVICE_URL: cluster internal url of the backend service. If cluster not used this is same as NEXT_PUBLIC_API_URL
NEXT_PUBLIC_API_URL= external url of the backend service. If cluster not used this is same as NEXT_PUBLIC_BACKEND_SERVICE_URL
