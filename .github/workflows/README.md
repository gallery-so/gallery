### End-to-End Testing with GitHub Actions

This GitHub Action is a continuous integration (CI) workflow that runs end-to-end (E2E) tests on a successful deployment. It is triggered by a deployment_status event, and it runs on an ubuntu-latest environment.

1. Sets up the workspace and checks out the repository's codebase.
2. Downloads and installs Keybase, and logs in using secrets.
3. Decrypts a file and extracts its contents.
4. Sets up QEMU. The action sets up the QEMU emulator, which is used to run Docker images for different architectures on the host machine.
5. Sets up the Docker Buildx. The action sets up Docker Buildx, which is used to build multi-architecture Docker images.
6. Caches Docker layers for faster builds.
7. Runs the E2E tests using docker-compose, and sets environment variables to configure the tests.

Its based on the recommendation from [synpress](https://github.com/Synthetixio/synpress#ci-tips--tricks) ci setup
