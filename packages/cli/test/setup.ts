// Force to use cli directory as root for oclif
process.env.OCLIF_TEST_ROOT = new URL("..", import.meta.url).pathname;
