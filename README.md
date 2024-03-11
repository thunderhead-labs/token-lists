# Token Lists

default token lists and token image repository

## Development

Instructions for setting up and running the various scripts locally

### Setup

```bash
# Install dependencies
yarn

# Generate Coingecko list
yarn coingecko
```

### Download images

There's a script that will fetch all images from a list and store them in `src/public/images/<chainId>/<address>.png`

```
yarn downloadImages
```
