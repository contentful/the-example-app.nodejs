## The node.js example app

The node.js example app teaches the very basics of how to work with Contentful:

- consuming Contentful's APIs
- modelling data
- editing content through Contentful's web app

The app demonstrates how decoupling content from its presentation enables greater flexibility and facilitates shipping higher quality software more quickly.

<a href="https://the-example-app-nodejs.herokuapp.com/" target="_blank"><img src="https://images.contentful.com/qz0n5cdakyl9/4GZmvrdodGM6CksMCkkAEq/700a527b8203d4d3ccd3c303c5b3e2aa/the-example-app.png" alt="Screenshot of the example app"/></a>

You can see a hosted version of `The node.js example app` on <a href="https://the-example-app-nodejs.herokuapp.com/" target="_blank">Heroku</a>.

## What is Contentful?
Contentful is content infrastructure for web applications, mobile apps and connected devices. It allows you to create, edit and manage content in the cloud and publish it anywhere via powerful APIs. Contentful offers tools for managing editorial teams and enabling cooperation between organizations.

## Requirements

* Node 8
* Git
* [Contentful CLI](https://www.npmjs.com/package/contentful-cli)

Without any changes, this app is connected to a Contentful space with read-only access. To experience the full end-to-end Contentful experience, you need to connect the app to a Contentful space where you have read and write access. This enables you to see how content editing in the Contentful web app works and how content changes propagate to this app.

[Signing up](https://www.contentful.com/sign-up/) to Contentful is free. 

You can clone the space for this example app to your own Contentful account by using our [CLI](https://www.npmjs.com/package/contentful-cli) tool.

```
contentful space seed -s '<SPACE_ID>' -t the-example-app
```

If you do not have the Contentful CLI installed you can find instructions on installation and usage [here](https://github.com/contentful/contentful-cli). For more information on the content model check out [this repo](https://github.com/contentful/content-models/tree/master/the-example-app/README.md). 

Once you’ve created a space, you can change the credentials in the variables.env. If you don’t feel like changing code immediately, you can also inject credentials via url parameters like so:

```
http://localhost:3000?space_id=<YOUR_CLONED_SPACE_ID>&delivery_token=<YOUR_DELIVERY_TOKEN>&preview_token=<YOUR_PREVIEW_TOKEN>
```

## Installing the Node.js app

```bash
git clone https://github.com/contentful/the-example-app.nodejs.git
```

```bash
npm install
```

##  Running the Node.js app

To start the server, run the following

```bash
npm run start:dev
```

Open [https://localhost:3000](https://localhost:3000) and take a look around. If you have configured the app to connect to a space that you own, use [https://localhost:3000?enable_editorial_features](https://localhost:3000?enable_editorial_features). This URL flag adds an “Edit” button in the app on every editable piece of content which will take you back to Contentful web app where you can make changes. It also adds “Draft” and “Pending Changes” status indicators to all content if relevant.

