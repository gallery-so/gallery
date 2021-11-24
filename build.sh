#!/bin/bash

if [[ $VERCEL_GIT_COMMIT_REF == "nextjs"  ]] ; then
  yarn next build && yarn next export -o build;
else
  CI=false node scripts/build.js
fi