# the-example-app.js
The Contentful example app, written in JS

## Requirements

* Node 8
* Git


## Installation

```bash
git clone --recursive https://github.com/contentful/example-contentful-university-js.git
```

```bash
npm install
```

## Usage

```
npm start
```

Open http://localhost:3000/?enable_editorial_features in your browser.

## Deep links

The following deep links are supported:

* `?enable_editorial_features` - Shows `Edit in web app` button on every content type plus `Draft` and `Pending Changes` status pills
* `?space_id=xxx&delivery_access_token=xxx&preview_access_token=xxx` - Configure the connected space


