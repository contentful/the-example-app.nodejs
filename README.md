## The node.js Example App

The node.js Example App aims at getting across the very basics of how to work with our headless content management system and how to build apps using our officially supported JavaScript SDK. You’ll learn best practices for using the SDK to deliver content to your app and additionally learn some techniques for modelling your content in Contentful. 

We hope this app will give you a better understanding of how decoupling content from its presentation enables greater flexibility and facilitates shipping higher quality software more quickly.

Contentful is a content management platform for web applications, mobile apps and connected devices. It allows you to create, edit and manage content in the cloud and publish it anywhere via powerful API. Contentful offers tools for managing editorial teams and enabling cooperation between organizations.

<a href="https://the-example-app-nodejs.herokuapp.com/" target="_blank"><img src="https://images.contentful.com/qz0n5cdakyl9/4GZmvrdodGM6CksMCkkAEq/700a527b8203d4d3ccd3c303c5b3e2aa/the-example-app.png" alt="Screenshot of the example app"/></a>

## Requirements

* Node 8
* Git

Without any changes, this app is connected to a Contentful space that is not publicly accessible. The full end-to-end Contentful experience requires you to clone this space to your own Contentful account, and enables you to see how content editing in the Contentful web app and see those changes propagate to this running application. Signing up and getting started with our free plan is... free! 

You can clone the space for this example app to your own Contentful account by using our CLI tool.

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

