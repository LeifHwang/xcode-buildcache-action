refer to [buildcache-action](https://github.com/mikehardy/buildcache-action)

# Accelerate builds using buildcache
Use this GitHub Action to accelerate compilation in your GitHub workflows using [buildcache](https://gitlab.com/bits-n-bites/buildcache)

## Workflow Integration
### Default Style

The defaults fit most projects well.

```yaml
jobs:
  ios:
  runs-on: macos-latest
  steps:
    - uses: mikehardy/buildcache-action@v2
```

## Build Integration
### Minimal change: override compiler on command line

If you want to isolate the integration to the Github Actions CI environment, run your Xcode build using specific overrides.

```sh
xcodebuild CC=clang CPLUSPLUS=clang++ LD=clang LDPLUSPLUS=clang++ <all other parameters>`
`